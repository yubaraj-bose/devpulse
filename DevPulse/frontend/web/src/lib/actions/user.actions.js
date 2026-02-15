"use server";

import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";

const SECTION_TYPE_MAP = {
  openSource: "OPEN_SOURCE",
  projects: "PROJECT",
  tutorials: "TUTORIAL",
  articles: "ARTICLE",
};

export async function deleteUserAccountAction(userId) {
  try {
    // remove from your DB first
    await prisma.user.deleteMany({ where: { id: userId } });

    // attempt to delete from Clerk using the SDK if available
    try {
      if (typeof clerkClient !== "undefined" && clerkClient?.users) {
        // some clerk SDKs expose deleteUser, others might use delete — check both
        if (typeof clerkClient.users.deleteUser === "function") {
          await clerkClient.users.deleteUser(userId);
        } else if (typeof clerkClient.users.delete === "function") {
          await clerkClient.users.delete(userId);
        } else {
          throw new Error("clerkClient.users exists but has no delete method");
        }
      } else {
        // fallback to Clerk REST API
        const clerkApiKey = process.env.CLERK_SECRET_KEY;
        if (!clerkApiKey) throw new Error("CLERK_API_KEY missing for Clerk REST fallback");

        const res = await fetch(`https://api.clerk.dev/v1/users/${encodeURIComponent(userId)}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${clerkApiKey}`,
            "Content-Type": "application/json",
          },
        });

        // treat 204/200 as success; 404 means user already deleted (also treat as success)
        if (res.status === 204 || res.status === 200 || res.status === 404) {
          // ok
        } else {
          const body = await res.text();
          throw new Error(`Clerk REST delete failed: ${res.status} ${body}`);
        }
      }
    } catch (clerkErr) {
      // if clerk returns not found, treat it as success
      if (clerkErr?.status === 404 || clerkErr?.statusCode === 404) {
        return { success: true };
      }
      console.error("Clerk deletion error:", clerkErr);
      return { success: false, error: clerkErr.message || String(clerkErr) };
    }

    return { success: true };
  } catch (error) {
    // DB-level 404 -> success
    if (error?.status === 404) return { success: true };
    console.error("Critical Deletion Error:", error);
    return { success: false, error: error.message || "Failed to wipe account data." };
  }
}


export async function createDatabaseUser(clerkData) {
  try {
    const { id, first_name, last_name, image_url, username } = clerkData;
    const newUser = await prisma.user.create({
      data: {
        id,
        username: username || `user_${id.slice(-6)}`,
        displayName: `${first_name || ""} ${last_name || ""}`.trim() || "New Dev",
        avatar: image_url,
        socials: { create: {} },
        settings: { create: {} },
      },
    });
    return newUser;
  } catch (error) {
    console.error("Error creating user in DB:", error);
    return null;
  }
}

export async function getUserProfile(identifier) {
  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ username: identifier }, { id: identifier }] },
      include: {
        socials: true,
        sections: { orderBy: { createdAt: "desc" } },
        settings: true,
      },
    });
    if (!user) return null;
    return {
      ...user,
      ownerId: user.id,
      sections: {
        openSource: user.sections.filter((s) => s.type === "OPEN_SOURCE"),
        projects: user.sections.filter((s) => s.type === "PROJECT"),
        tutorials: user.sections.filter((s) => s.type === "TUTORIAL"),
        articles: user.sections.filter((s) => s.type === "ARTICLE"),
      },
      stats: {
        posts: user.sections.length,
        stars: 0,
        views: 0,
        followers: 0,
        following: 0,
      },
    };
  } catch (error) {
    console.error("Database Fetch Error:", error);
    return null;
  }
}

export async function updateProfile(userId, data) {
  try {
    const { displayName, avatar, bio, website, socials = {}, username } = data;
    await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        displayName,
        avatar,
        bio,
        website,
        socials: {
          upsert: {
            create: {
              github: socials.github || "",
              youtube: socials.youtube || "",
              linkedin: socials.linkedin || "",
              instagram: socials.instagram || "",
            },
            update: {
              github: socials.github || "",
              youtube: socials.youtube || "",
              linkedin: socials.linkedin || "",
              instagram: socials.instagram || "",
            },
          },
        },
      },
    });
    if (username) revalidatePath(`/u/${username}`);
    return { success: true };
  } catch (error) {
    console.error("Profile Update Error:", error);
    if (error?.code === "P2002") throw new Error("This username is already taken.");
    throw new Error("Failed to update profile");
  }
}

function normalizeTags(tags) {
  if (!tags) return [];
  return Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim()).filter(Boolean);
}

export async function saveSectionItem(userId, username, itemData) {
  const { id, key, title, description, link, tags } = itemData;
  const type = SECTION_TYPE_MAP[key] || itemData.type || "PROJECT";
  const normalizedTags = normalizeTags(tags);

  try {
    if (id) {
      await prisma.sectionItem.update({
        where: { id },
        data: { title, description, link, tags: normalizedTags },
      });
    } else {
      await prisma.sectionItem.create({
        data: {
          userId,
          type,
          title,
          description,
          link,
          tags: normalizedTags,
        },
      });
    }
    if (username) revalidatePath(`/u/${username}`);
    return { success: true };
  } catch (error) {
    console.error("Section Save Error:", error);
    throw new Error("Failed to save section item");
  }
}

export async function deleteSectionItemAction(itemId, username) {
  try {
    await prisma.sectionItem.delete({ where: { id: itemId } });
    if (username) revalidatePath(`/u/${username}`);
    return { success: true };
  } catch (error) {
    console.error("Section Delete Error:", error);
    throw new Error("Failed to delete item");
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageAction(base64Image) {
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "devpulse_avatars",
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Failed to upload image");
  }
}