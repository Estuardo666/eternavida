import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { adminProductFormSchema } from "@/features/admin-catalog/schemas/admin-catalog.schema";
import { CatalogConflictError } from "@/services/admin-catalog/admin-catalog.errors";
import { mapAdminProductItem } from "@/services/admin-catalog/get-catalog-admin-data";
import { createProduct } from "@/services/admin-catalog/product-crud";
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

    const validationResult = adminProductFormSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return createErrorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const product = await createProduct(validationResult.data);

    return NextResponse.json(
      {
        success: true,
        data: {
          product: mapAdminProductItem(product),
        },
        timestamp,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin product POST error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return createErrorResponse(409, "CONFLICT", "Product slug already exists.", timestamp);
    }

    if (error instanceof CatalogConflictError) {
      return createErrorResponse(409, "CONFLICT", error.message, timestamp);
    }

    const message = error instanceof Error ? error.message : "Failed to create product.";
    const status = message.includes("media asset") ? 422 : message.includes("already exists") ? 409 : 500;
    const code = status === 422 ? "VALIDATION_ERROR" : status === 409 ? "CONFLICT" : "INTERNAL_ERROR";

    return createErrorResponse(status, code, message, timestamp);
  }
}
