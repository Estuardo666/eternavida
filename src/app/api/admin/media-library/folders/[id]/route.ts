import { type NextRequest, NextResponse } from "next/server";

import { updateFolderSchema } from "@/features/admin-media/schemas/media-library.schema";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { deleteFolder } from "@/services/admin-media/delete-media-folder";
import { updateFolder } from "@/services/admin-media/update-media-folder";
import { MediaLibraryConflictError, MediaLibraryNotFoundError } from "@/services/admin-media/admin-media.errors";

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

    const validationResult = updateFolderSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return errorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const folder = await updateFolder(id, validationResult.data);
    return NextResponse.json({ success: true, data: { folder }, timestamp }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/media-library/folders/[id] error:", error);
    if (error instanceof MediaLibraryNotFoundError) return errorResponse(404, "NOT_FOUND", error.message, timestamp);
    if (error instanceof MediaLibraryConflictError) return errorResponse(409, "CONFLICT", error.message, timestamp);
    return errorResponse(500, "INTERNAL_ERROR", "Failed to update folder.", timestamp);
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
    const result = await deleteFolder(id);
    return NextResponse.json({ success: true, data: result, timestamp }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/media-library/folders/[id] error:", error);
    if (error instanceof MediaLibraryNotFoundError) return errorResponse(404, "NOT_FOUND", error.message, timestamp);
    return errorResponse(500, "INTERNAL_ERROR", "Failed to delete folder.", timestamp);
  }
}
