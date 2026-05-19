import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { CheckoutPricingError } from "@/server/pricing/pricing.errors";
import {
  adminPromotionPreviewRequestSchema,
  normalizeAdminPromotionPreviewInput,
} from "@/server/pricing/promotion.schemas";
import { buildCheckoutPricingPreview } from "@/server/pricing/pricing.service";

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

    const validationResult = adminPromotionPreviewRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return createErrorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const normalizedInput = normalizeAdminPromotionPreviewInput(validationResult.data);
    const preview = await buildCheckoutPricingPreview(
      {
        items: normalizedInput.items,
        shippingMethod: normalizedInput.shippingMethod,
        couponCode: normalizedInput.couponCode,
      },
      {
        draftPromotion: normalizedInput.promotion,
        excludePromotionIds: normalizedInput.editingPromotionId ? [normalizedInput.editingPromotionId] : [],
      },
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          preview,
        },
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin promotion preview POST error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    if (error instanceof CheckoutPricingError) {
      return createErrorResponse(error.status, error.code, error.message, timestamp);
    }

    return createErrorResponse(500, "INTERNAL_ERROR", "Failed to simulate promotion pricing.", timestamp);
  }
}