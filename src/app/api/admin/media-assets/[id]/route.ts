import { type NextRequest, NextResponse } from "next/server";

import { updateMediaAssetSchema } from "@/features/admin-media/schemas/media-library.schema";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { deleteAsset } from "@/services/admin-media/delete-media-asset";
import { updateAsset } from "@/services/admin-media/update-media-asset";
import { MediaLibraryNotFoundError } from "@/services/admin-media/admin-media.errors";
import { CloudflareR2ConfigurationError } from "@/server/storage/cloudflare-r2";

function errorResponse(status: number, code: string, message: string, timestamp: string): NextResponse {
  return NextResponse.json({ success: false, error: { code, message }, timestamp }, { status });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { id } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.", timestamp);
    }

    const validationResult = updateMediaAssetSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return errorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const asset = await updateAsset(id, validationResult.data);
    return NextResponse.json({ success: true, data: { mediaAsset: asset }, timestamp }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/media-assets/[id] error:", error);
    if (error instanceof MediaLibraryNotFoundError) return errorResponse(404, "NOT_FOUND", error.message, timestamp);
    return errorResponse(500, "INTERNAL_ERROR", "Failed to update media asset.", timestamp);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { id } = await context.params;
    const result = await deleteAsset(id);
    return NextResponse.json({ success: true, data: result, timestamp }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/media-assets/[id] error:", error);
    if (error instanceof MediaLibraryNotFoundError) return errorResponse(404, "NOT_FOUND", error.message, timestamp);
    if (error instanceof CloudflareR2ConfigurationError) return errorResponse(503, "R2_UNAVAILABLE", error.message, timestamp);
    return errorResponse(500, "INTERNAL_ERROR", "Failed to delete media asset.", timestamp);
  }
}
