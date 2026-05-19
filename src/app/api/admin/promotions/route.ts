import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { getAdminPromotions, mapAdminPromotionItem } from "@/services/admin-promotions/get-admin-promotions";
import { createPromotion } from "@/services/admin-promotions/promotion-crud";
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const promotions = await getAdminPromotions();

    return NextResponse.json(
      {
        success: true,
        data: {
          promotions,
        },
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin promotions GET error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    return createErrorResponse(500, "INTERNAL_ERROR", "Failed to load promotions.", timestamp);
  }
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

    const validationResult = adminPromotionFormSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return createErrorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const promotion = await createPromotion(normalizeAdminPromotionInput(validationResult.data));

    return NextResponse.json(
      {
        success: true,
        data: {
          promotion: mapAdminPromotionItem(promotion),
        },
        timestamp,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin promotions POST error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return createErrorResponse(409, "CONFLICT", "Promotion couponCode already exists.", timestamp);
    }

    const message = error instanceof Error ? error.message : "Failed to create promotion.";
    const status = message.includes("do not exist") ? 422 : 500;
    const code = status === 422 ? "VALIDATION_ERROR" : "INTERNAL_ERROR";

    return createErrorResponse(status, code, message, timestamp);
  }
}