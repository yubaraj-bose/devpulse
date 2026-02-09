import { NextResponse } from "next/server";

/*
  Temporary in-memory notifications store
  ⚠ resets when server restarts
*/

let notifications = [
  {
    id: "1",
    title: "Welcome 👋",
    body: "Thanks for joining DevPulse!",
    createdAt: new Date(),
    read: false,
  },
];

/* =========================
   GET → fetch all
========================= */
export async function GET() {
  return NextResponse.json(notifications);
}

/* =========================
   POST → create new
========================= */
export async function POST(req) {
  const { title, body } = await req.json();

  const newNotification = {
    id: crypto.randomUUID(),
    title,
    body,
    createdAt: new Date(),
    read: false,
  };

  notifications.unshift(newNotification);

  return NextResponse.json(newNotification);
}

/* =========================
   PATCH → mark read
   body: { id }
========================= */
export async function PATCH(req) {
  const { id } = await req.json();

  notifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );

  return NextResponse.json({ success: true });
}

/* =========================
   DELETE → clear all
========================= */
export async function DELETE() {
  notifications = [];
  return NextResponse.json({ success: true });
}
