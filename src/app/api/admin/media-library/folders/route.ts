import { type NextRequest, NextResponse } from "next/server";

import { createFolderSchema } from "@/features/admin-media/schemas/media-library.schema";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { createFolder } from "@/services/admin-media/create-media-folder";
import { listMediaFoldersAsTree } from "@/services/admin-media/list-media-folders";
import { MediaLibraryNotFoundError } from "@/services/admin-media/admin-media.errors";

function errorResponse(status: number, code: string, message: string, timestamp: string): NextResponse {
  return NextResponse.json({ success: false, error: { code, message }, timestamp }, { status });
}

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const folders = await listMediaFoldersAsTree();
    return NextResponse.json({ success: true, data: { folders }, timestamp }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/media-library/folders error:", error);
    return errorResponse(500, "INTERNAL_ERROR", "Failed to fetch folders.", timestamp);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.", timestamp);
    }

    const validationResult = createFolderSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return errorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const folder = await createFolder(validationResult.data);
    return NextResponse.json({ success: true, data: { folder }, timestamp }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/media-library/folders error:", error);
    if (error instanceof MediaLibraryNotFoundError) {
      return errorResponse(404, "NOT_FOUND", error.message, timestamp);
    }
    return errorResponse(500, "INTERNAL_ERROR", "Failed to create folder.", timestamp);
  }
}
