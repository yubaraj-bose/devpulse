import { NextResponse } from "next/server";
import { createCloudinaryUploadSignature } from "@/lib/actions/user.actions";

/**
 * API Route: Get Cloudinary Signature
 * This route acts as a bridge between the client-side fetch and the server action.
 */

export async function GET() {
  try {
    // FIXED: Added 'await' because createCloudinaryUploadSignature is an async function.
    // Without 'await', this returns a Promise object which cannot be serialized to JSON,
    // causing Next.js to throw an error and return a 500 HTML page.
    const data = await createCloudinaryUploadSignature({
      folder: "devpulse_avatars"
    });

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Signature Generation Error:", error);
    
    // Ensure we return JSON even on failure so the frontend doesn't receive an HTML error page
    return NextResponse.json(
      { 
        error: "Failed to generate upload signature",
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}