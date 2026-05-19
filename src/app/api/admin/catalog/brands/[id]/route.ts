import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { adminBrandFormSchema } from "@/features/admin-catalog/schemas/admin-catalog.schema";
import { CatalogConflictError } from "@/services/admin-catalog/admin-catalog.errors";
import { deleteBrand, updateBrand } from "@/services/admin-catalog/brand-crud";
import { mapAdminBrandItem } from "@/services/admin-catalog/get-catalog-admin-data";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";

function createErrorResponse(status: number, code: string, message: string, timestamp: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
      timestamp,
    },
    { status },
  );
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
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

    const validationResult = adminBrandFormSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
      return createErrorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const brand = await updateBrand(id, validationResult.data);

    return NextResponse.json(
      {
        success: true,
        data: {
          brand: mapAdminBrandItem(brand),
        },
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return createErrorResponse(409, "CONFLICT", "Brand name already exists.", timestamp);
    }

    if (error instanceof CatalogConflictError) {
      return createErrorResponse(409, "CONFLICT", error.message, timestamp);
    }

    const message = error instanceof Error ? error.message : "Failed to update brand.";
    const status = message.includes("not found") ? 404 : message.includes("media asset") ? 422 : message.includes("already exists") ? 409 : 500;
    const code = status === 404 ? "NOT_FOUND" : status === 422 ? "VALIDATION_ERROR" : status === 409 ? "CONFLICT" : "INTERNAL_ERROR";

    return createErrorResponse(status, code, message, timestamp);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await context.params;
    const result = await deleteBrand(id);

    return NextResponse.json(
      {
        success: true,
        data: result,
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete brand.";
    const status = message.includes("not found") ? 404 : 500;
    const code = status === 404 ? "NOT_FOUND" : "INTERNAL_ERROR";

    return createErrorResponse(status, code, message, timestamp);
  }
}
