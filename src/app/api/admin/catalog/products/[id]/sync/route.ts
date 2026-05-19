import { NextRequest, NextResponse } from "next/server";

import { adminProductSyncRequestSchema } from "@/features/admin-catalog/schemas/admin-catalog.schema";
import { syncSingleAdminProduct } from "@/services/admin-catalog/sync-product";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";

function createErrorResponse(
  status: number,
  code: string,
  message: string,
  timestamp: string,
): NextResponse {
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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.", timestamp);
    }

    const validationResult = adminProductSyncRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return createErrorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const result = await syncSingleAdminProduct(id, validationResult.data);

    return NextResponse.json(
      {
        success: true,
        data: result,
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin product sync POST error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    const message = error instanceof Error ? error.message : "Failed to sync product.";
    const status = message.includes("not found")
      ? 404
      : message.includes("Unsupported sync mode")
        ? 422
        : 500;
    const code = status === 404 ? "NOT_FOUND" : status === 422 ? "VALIDATION_ERROR" : "INTERNAL_ERROR";

    return createErrorResponse(status, code, message, timestamp);
  }
}