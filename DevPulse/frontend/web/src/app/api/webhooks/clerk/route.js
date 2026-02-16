// app/api/webhooks/clerk/route.js
import { Webhook } from "svix";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

/**
 * Clerk webhook receiver (Svix-signed)
 * Fixed: Removed dangerous object fallbacks & String.prototype collisions
 */

function extractUserFields(maybeUser = {}) {
  // 1. Get the email from Clerk's specific array structure
  const rawEmail = 
    (Array.isArray(maybeUser.email_addresses) && maybeUser.email_addresses[0]?.email_address) || 
    null;

  // 2. Safely extract standard string fields
  const id = typeof maybeUser.id === "string" ? maybeUser.id : null;
  const firstName = maybeUser.first_name || "";
  const lastName = maybeUser.last_name || "";
  const username = maybeUser.username || null;
  const avatar = maybeUser.image_url || maybeUser.profile_image_url || "";

  return { id, rawEmail, firstName, lastName, username, avatar };
}

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET env var");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const rawBody = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Pass ONLY the data payload to our extractor
  const evtData = evt?.data ?? {};
  const { id, rawEmail, firstName, lastName, username, avatar } = extractUserFields(evtData);

  // Strict check: if ID isn't a string, something is horribly wrong with the payload
  if (!id) {
    console.error("Webhook payload missing valid user id");
    return new Response("Missing valid user id", { status: 400 });
  }

  // Ensure email is valid and never null (if your Prisma schema requires it to be a string)
  // If Clerk doesn't provide an email, we fallback to a placeholder to prevent Prisma crashes
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : `no-email-${id}@placeholder.com`;
  
  const computedDisplayName = `${firstName} ${lastName}`.trim() || "New Dev";
  const computedUsername = typeof username === "string" && username.trim() ? username.trim() : `user_${id.slice(-6)}`;

  try {
    if (evt.type === "user.created" || evt.type === "user.updated") {
      await prisma.user.upsert({
        where: { id: id }, 
        create: {
          id: id,
          email: email, // Now guaranteed to be a string
          username: computedUsername,
          displayName: computedDisplayName,
          avatar: avatar || null,
          socials: { create: {} },
          settings: { create: {} },
        },
        update: {
          email: email,
          username: computedUsername,
          displayName: computedDisplayName,
          avatar: avatar || undefined,
        },
      });

      console.log(`Clerk ${evt.type} synced: ${id}`);
    } 
    
    else if (evt.type === "user.deleted") {
      await prisma.user.deleteMany({ where: { id: id } });
      console.log(`Clerk user.deleted synced: ${id}`);
    }

    return new Response(JSON.stringify({ ok: true, event: evt.type }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal error", { status: 500 });
  }
}