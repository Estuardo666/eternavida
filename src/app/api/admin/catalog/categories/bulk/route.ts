import { NextRequest, NextResponse } from "next/server";

import { adminCatalogBulkActionSchema } from "@/features/admin-catalog/schemas/admin-catalog.schema";
import { CatalogBulkActionError } from "@/services/admin-catalog/admin-catalog.errors";
import { applyCategoryBulkAction } from "@/services/admin-catalog/category-crud";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";

function createErrorResponse(status: number, code: string, message: string, timestamp: string) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
      timestamp,
    },
    { status },
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.", timestamp);
    }

    const validationResult = adminCatalogBulkActionSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return createErrorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const result = await applyCategoryBulkAction(
      validationResult.data.ids,
      validationResult.data.action,
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin category bulk POST error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    if (error instanceof CatalogBulkActionError) {
      return createErrorResponse(409, "CONFLICT", error.message, timestamp);
    }

    const message = error instanceof Error ? error.message : "Failed to apply the bulk category action.";
    return createErrorResponse(500, "INTERNAL_ERROR", message, timestamp);
  }
}