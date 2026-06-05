import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { uploadObjectToCloudflareR2, buildR2PublicUrl } from "@/server/storage/cloudflare-r2";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required." },
          timestamp,
        },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "A file is required." },
          timestamp,
        },
        { status: 422 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Only JPEG, PNG, and WebP images are allowed." },
          timestamp,
        },
        { status: 422 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Image must be smaller than 5 MB." },
          timestamp,
        },
        { status: 422 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "jpg";
    const storageKey = `public/reviews/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { publicUrl } = await uploadObjectToCloudflareR2({
      storageKey,
      body: buffer,
      contentType: file.type,
      contentLength: buffer.length,
    });

    const url = publicUrl ?? buildR2PublicUrl(storageKey) ?? storageKey;

    return NextResponse.json(
      { success: true, data: { url, storageKey }, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Review image upload error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to upload image." },
        timestamp,
      },
      { status: 500 },
    );
  }
}