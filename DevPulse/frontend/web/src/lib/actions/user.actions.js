"use server";

import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * DevPulse server helpers
 * - Handles Clerk (v4/v5) differences
 * - Idempotent create (upsert)
 * - Safe selective updates
 * - Cloudinary upload (guarded)
 */

const SECTION_TYPE_MAP = {
  openSource: "OPEN_SOURCE",
  projects: "PROJECT",
  tutorials: "TUTORIAL",
  articles: "ARTICLE",
};

async function getClerkClientInstance() {
  // Clerk v5 exports a function; older SDKs exported an object.
  try {
    if (typeof clerkClient === "function") {
      return await clerkClient();
    }
    return clerkClient;
  } catch (err) {
    console.error("Failed to get clerk client instance:", err);
    return null;
  }
}

/* -----------------------
   Deletion: DB first, Clerk second (safe and retriable)
   ----------------------- */
export async function deleteUserAccountAction(userId) {
  try {
    // Remove local DB records first (tolerant)
    await prisma.user.deleteMany({ where: { id: userId } });

    // Try Clerk SDK (v5) or fallback to REST
    try {
      const client = await getClerkClientInstance();

      if (client && client.users) {
        if (typeof client.users.deleteUser === "function") {
          await client.users.deleteUser(userId);
        } else if (typeof client.users.delete === "function") {
          await client.users.delete(userId);
        } else {
          throw new Error("Clerk client users exists but has no delete method");
        }
      } else {
        // REST fallback
        const clerkApiKey = process.env.CLERK_SECRET_KEY || process.env.CLERK_API_KEY;
        if (!clerkApiKey) throw new Error("CLERK_SECRET_KEY missing for Clerk REST fallback");

        const res = await fetch(`https://api.clerk.dev/v1/users/${encodeURIComponent(userId)}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${clerkApiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status !== 204 && res.status !== 200 && res.status !== 404) {
          const body = await res.text();
          throw new Error(`Clerk REST delete failed: ${res.status} ${body}`);
        }
      }
    } catch (clerkErr) {
      // treat not found as success
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

/* -----------------------
   Clerk payload normalization
   ----------------------- */
function extractClerkUserFields(clerkData = {}) {
  const email =
    clerkData.email ||
    (clerkData.primaryEmailAddress && clerkData.primaryEmailAddress.emailAddress) ||
    (Array.isArray(clerkData.emailAddresses) &&
      clerkData.emailAddresses[0] &&
      clerkData.emailAddresses[0].emailAddress) ||
    null;

  const firstName = clerkData.first_name || clerkData.firstName || "";
  const lastName = clerkData.last_name || clerkData.lastName || "";
  const imageUrl =
    clerkData.image_url ||
    clerkData.profileImageUrl ||
    clerkData.profile_image_url ||
    clerkData.imageUrl ||
    null;

  const username = clerkData.username || clerkData.external_username || null;

  return {
    id: clerkData.id || clerkData.userId || clerkData.sub || null,
    email,
    firstName,
    lastName,
    imageUrl,
    username,
  };
}

/* -----------------------
   Validation / sanitization helpers
   ----------------------- */
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  // Very small, permissive regex; use a stricter one if you want
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function sanitizeUsername(raw) {
  if (!raw || typeof raw !== "string") return null;
  const s = raw.trim().toLowerCase();
  // allow a-z0-9, hyphen, underscore; collapse multiple hyphens/underscores
  return s.replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^[-_]+|[-_]+$/g, "");
}

/* -----------------------
   Create (idempotent)
   ----------------------- */
export async function createDatabaseUser(clerkData) {
  try {
    const { id, email, firstName, lastName, imageUrl, username } = extractClerkUserFields(
      clerkData
    );

    if (!id) {
      console.error("createDatabaseUser: missing clerk id", clerkData);
      return null;
    }

    const sanitizedUsername = sanitizeUsername(username) || `user_${String(id).slice(-6)}`;
    const normalizedEmail = isValidEmail(email) ? email.trim().toLowerCase() : null;

    const user = await prisma.user.upsert({
      where: { id },
      create: {
        id,
        email: normalizedEmail,
        username: sanitizedUsername,
        displayName: `${firstName || ""} ${lastName || ""}`.trim() || "New Dev",
        avatar: imageUrl || null,
        socials: { create: {} },
        settings: { create: {} },
      },
      update: {
        // keep idempotent: update sensible fields from Clerk initial payload
        email: normalizedEmail || undefined,
        avatar: imageUrl || undefined,
        username: sanitizedUsername || undefined,
        displayName: `${firstName || ""} ${lastName || ""}`.trim() || undefined,
      },
    });

    return user;
  } catch (error) {
    console.error("Error creating/upserting user in DB:", error);
    return null;
  }
}

/* -----------------------
   Read: getUserProfile
   ----------------------- */
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
      // keep email available server-side; hide it in public responses at your route-level if desired
      email: user.email ?? null,
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

/* -----------------------
   Update: selective payload
   ----------------------- */
export async function updateProfile(userId, data) {
  try {
    const { displayName, avatar, bio, website, socials = {}, username, email } = data;

    const payload = {};

    if (typeof username === "string" && username.trim().length) payload.username = sanitizeUsername(username);
    if (typeof displayName === "string" && displayName.trim().length) payload.displayName = displayName.trim();
    if (typeof avatar === "string" && avatar.trim().length) payload.avatar = avatar.trim();
    if (typeof bio === "string") payload.bio = bio;
    if (typeof website === "string" && website.trim().length) payload.website = website.trim();

    payload.socials = {
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
    };

    if (typeof email === "string" && email.trim().length) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!isValidEmail(normalizedEmail)) {
        throw new Error("Invalid email format");
      }
      // NOTE: production recommendation — change email in Clerk first, then sync to DB
      payload.email = normalizedEmail;
      // optional: if you maintain an emailVerified flag, set it false here and wait for verification webhook
      // check existence of column before updating it (defensive)
      try {
        const colCheck = await prisma.$queryRaw`SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'emailVerified'`;
        if (Array.isArray(colCheck) && colCheck.length > 0) {
          // emailVerified column exists; mark false on manual change
          payload.emailVerified = false;
        }
      } catch (e) {
        // ignore if the check fails; do not block update
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: payload,
    });

    if (payload.username) revalidatePath(`/u/${payload.username}`);
    return { success: true };
  } catch (error) {
    console.error("Profile Update Error:", error);

    if (error?.code === "P2002") {
      const target = (error?.meta && error.meta.target) || "";
      if (String(target).includes("email")) throw new Error("This email is already taken.");
      if (String(target).includes("username")) throw new Error("This username is already taken.");
      throw new Error("Unique constraint failed.");
    }

    throw new Error(error.message || "Failed to update profile");
  }
}

/* -----------------------
   Tags helper
   ----------------------- */
function normalizeTags(tags) {
  if (!tags) return [];
  return Array.isArray(tags) ? tags : String(tags).split(",").map((t) => t.trim()).filter(Boolean);
}

/* -----------------------
   Sections (create/update/delete)
   ----------------------- */
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

/* -----------------------
   Cloudinary upload (guarded)
   ----------------------- */
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  // Keep it silent; attempts to upload will still throw with a clear message.
  console.warn("Cloudinary credentials missing; uploadImageAction will error until configured.");
}

export async function uploadImageAction(base64Image) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary credentials are not configured on the server.");
  }

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
