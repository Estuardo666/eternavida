import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { adminProductFormSchema } from "@/features/admin-catalog/schemas/admin-catalog.schema";
import { CatalogConflictError } from "@/services/admin-catalog/admin-catalog.errors";
import { mapAdminProductItem } from "@/services/admin-catalog/get-catalog-admin-data";
import { deleteProduct, updateProduct } from "@/services/admin-catalog/product-crud";
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

export async function PUT(
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

    const validationResult = adminProductFormSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return createErrorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const product = await updateProduct(id, validationResult.data);

    return NextResponse.json(
      {
        success: true,
        data: {
          product: mapAdminProductItem(product),
        },
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin product PUT error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return createErrorResponse(409, "CONFLICT", "Product slug already exists.", timestamp);
    }

    if (error instanceof CatalogConflictError) {
      return createErrorResponse(409, "CONFLICT", error.message, timestamp);
    }

    const message = error instanceof Error ? error.message : "Failed to update product.";
    const status = message.includes("not found") ? 404 : message.includes("media asset") ? 422 : message.includes("already exists") ? 409 : 500;
    const code = status === 404 ? "NOT_FOUND" : status === 422 ? "VALIDATION_ERROR" : status === 409 ? "CONFLICT" : "INTERNAL_ERROR";

    return createErrorResponse(status, code, message, timestamp);
  }
}

export async function DELETE(
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
    const result = await deleteProduct(id);

    return NextResponse.json(
      {
        success: true,
        data: result,
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin product DELETE error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    const message = error instanceof Error ? error.message : "Failed to delete product.";
    const status = message.includes("not found") ? 404 : message.includes("featured on Home") ? 409 : 500;
    const code = status === 404 ? "NOT_FOUND" : status === 409 ? "CONFLICT" : "INTERNAL_ERROR";

    return createErrorResponse(status, code, message, timestamp);
  }
}
