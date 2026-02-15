import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Check if the Prisma client is initialized
    if (!prisma) {
      throw new Error("Prisma client is not initialized.");
    }

    // 2. Perform a simple count on the User table
    // This verifies the connection string and the schema sync
    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      message: "Vibrant backend is ALIVE!",
      data: {
        connection: "Successful",
        database: "Neon (PostgreSQL)",
        currentUserCount: userCount,
      },
    });
  } catch (error) {
    console.error("Database test failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}