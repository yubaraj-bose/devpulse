import { Webhook } from 'svix'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env')
  }

  // 1. Get the headers (Next.js 16: headers() is async)
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 })
  }

  // 2. Get the RAW body as text
  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // 3. Verify the payload
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', { status: 400 })
  }

  const eventType = evt.type;
  
  if (eventType === 'user.created') {
    const { id, email_addresses, username, image_url } = evt.data;

    try {
      // 4. Sync to Neon via Prisma with schema-matching fields
      await prisma.user.create({
        data: {
          clerkId: id,
          // Safely get email or empty string if missing
          email: email_addresses?.[0]?.email_address || "", 
          // Ensure username is never null to satisfy @unique
          username: username || `user_${id.slice(-6)}`, 
          profilePhoto: image_url || "",
          totalUpvoteCnt: 0, // Matches your schema name
        },
      })
      console.log(`User ${id} successfully synced to database.`);
      return new Response('User created', { status: 200 });
    } catch (dbError) {
      console.error('Prisma Error:', dbError);
      // This will show exactly what field failed in your Vercel logs
      return new Response('Database Error', { status: 500 });
    }
  }

  return new Response('Webhook received', { status: 200 })
}