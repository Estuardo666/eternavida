import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { mapAdminPromotionItem } from "@/services/admin-promotions/get-admin-promotions";
import { deletePromotion, updatePromotion } from "@/services/admin-promotions/promotion-crud";
import {
  adminPromotionFormSchema,
  normalizeAdminPromotionInput,
} from "@/server/pricing/promotion.schemas";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";

function createErrorResponse(status: number, code: string, message: string, timestamp: string): NextResponse {
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.", timestamp);
    }

    const validationResult = adminPromotionFormSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return createErrorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const { id } = await context.params;
    const promotion = await updatePromotion(id, normalizeAdminPromotionInput(validationResult.data));

    return NextResponse.json(
      {
        success: true,
        data: {
          promotion: mapAdminPromotionItem(promotion),
        },
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin promotions PUT error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return createErrorResponse(409, "CONFLICT", "Promotion couponCode already exists.", timestamp);
    }

    const message = error instanceof Error ? error.message : "Failed to update promotion.";
    const status = message === "Promotion not found." ? 404 : message.includes("do not exist") ? 422 : 500;
    const code = status === 404 ? "NOT_FOUND" : status === 422 ? "VALIDATION_ERROR" : "INTERNAL_ERROR";

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
    await deletePromotion(id);

    return NextResponse.json(
      {
        success: true,
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin promotions DELETE error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    const message = error instanceof Error ? error.message : "Failed to delete promotion.";
    const status = message === "Promotion not found." ? 404 : 500;
    const code = status === 404 ? "NOT_FOUND" : "INTERNAL_ERROR";

    return createErrorResponse(status, code, message, timestamp);
  }
}