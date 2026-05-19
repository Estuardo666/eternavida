import { NextRequest, NextResponse } from "next/server";

import { uploadMediaAssetSchema } from "@/features/admin-content/schemas/admin-home-content.schema";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { CloudflareR2ConfigurationError } from "@/server/storage/cloudflare-r2";
import {
  MediaUploadValidationError,
  uploadMediaAsset,
} from "@/services/admin-content/upload-media-asset";

export const runtime = "nodejs";

function mapMediaAssetResponse(record: {
  id: string;
  storageKey: string;
  publicUrl: string | null;
  kind: "image" | "video";
  altText: string | null;
  mimeType: string | null;
  posterUrl: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: record.id,
    storageKey: record.storageKey,
    publicUrl: record.publicUrl,
    kind: record.kind,
    altText: record.altText ?? "",
    mimeType: record.mimeType,
    posterUrl: record.posterUrl,
    width: record.width,
    height: record.height,
    durationSeconds: record.durationSeconds,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function getOptionalField(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_FORM_DATA",
            message: "Request body must be valid multipart form data.",
          },
          timestamp,
        },
        { status: 400 },
      );
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_FILE",
            message: "A file is required for upload.",
          },
          timestamp,
        },
        { status: 400 },
      );
    }

    const validationResult = uploadMediaAssetSchema.safeParse({
      storageKey: getOptionalField(formData, "storageKey"),
      kind: getOptionalField(formData, "kind"),
      altText: getOptionalField(formData, "altText"),
      posterUrl: getOptionalField(formData, "posterUrl"),
      width: getOptionalField(formData, "width"),
      height: getOptionalField(formData, "height"),
      durationSeconds: getOptionalField(formData, "durationSeconds"),
    });

    if (!validationResult.success) {
      const message = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message,
          },
          timestamp,
        },
        { status: 422 },
      );
    }

    const mediaAsset = await uploadMediaAsset(file, validationResult.data);

    return NextResponse.json(
      {
        success: true,
        data: {
          mediaAsset: mapMediaAssetResponse(mediaAsset),
        },
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin media assets upload POST error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    if (error instanceof CloudflareR2ConfigurationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "R2_UPLOAD_UNAVAILABLE",
            message: error.message,
          },
          timestamp,
        },
        { status: 503 },
      );
    }

    if (error instanceof MediaUploadValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UPLOAD_VALIDATION_ERROR",
            message: error.message,
          },
          timestamp,
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to upload media asset.",
        },
        timestamp,
      },
      { status: 500 },
    );
  }
}