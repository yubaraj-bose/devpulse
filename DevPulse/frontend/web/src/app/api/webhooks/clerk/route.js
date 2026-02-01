import { Webhook } from 'svix'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env')
  }

  // Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the 'user.created' event
  const eventType = evt.type;
  
  if (eventType === 'user.created') {
    const { id, email_addresses, username, image_url } = evt.data;

    try {
      // Sync to Neon PostgreSQL via Prisma
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0].email_address,
          username: username || `dev_${id.slice(0, 6)}`,
          profilePhoto: image_url,
          karma: 0
        },
      })
      console.log(`User ${id} successfully synced to database.`);
    } catch (dbError) {
      console.error('Prisma Error:', dbError);
      return new Response('Database Error', { status: 500 });
    }
  }

  return new Response('Webhook processed', { status: 200 })
}