import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." }, timestamp }, { status: 401 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ success: false, error: { code: "INVALID_FORM_DATA", message: "Request must be multipart form data." }, timestamp }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: { code: "MISSING_FILE", message: "A file is required." }, timestamp }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: { code: "INVALID_FILE_TYPE", message: "File must be an image." }, timestamp }, { status: 422 });
    }

    const client = await clerkClient();
    const updated = await client.users.updateUserProfileImage(userId, { file });

    return NextResponse.json({
      success: true,
      data: { imageUrl: updated.imageUrl ?? "" },
      timestamp,
    });
  } catch (error) {
    console.error("Client profile avatar POST error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update avatar." }, timestamp }, { status: 500 });
  }
}
