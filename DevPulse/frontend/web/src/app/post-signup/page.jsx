import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function PostSignupPage() {
  const { sessionId } = await auth();

  if (sessionId) {
    const client = await clerkClient();
    await client.sessions.revokeSession(sessionId);
  }

  redirect("/sign-in");
}
