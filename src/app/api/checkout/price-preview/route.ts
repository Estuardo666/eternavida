import { NextRequest, NextResponse } from "next/server";

import { buildCheckoutPricingPreview } from "@/server/pricing/pricing.service";
import {
  CheckoutPricingError,
  type CheckoutPricingErrorDetails,
} from "@/server/pricing/pricing.errors";
import {
  checkoutPricePreviewRequestSchema,
  normalizeCheckoutPricePreviewInput,
} from "@/server/pricing/promotion.schemas";

function createErrorResponse(
  status: number,
  code: string,
  message: string,
  timestamp: string,
  details?: CheckoutPricingErrorDetails,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && Object.keys(details).length > 0 ? { details } : {}),
      },
      timestamp,
    },
    { status },
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.", timestamp);
    }

    const validationResult = checkoutPricePreviewRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return createErrorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const preview = await buildCheckoutPricingPreview(normalizeCheckoutPricePreviewInput(validationResult.data));

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
    console.error("Checkout price preview POST error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    if (error instanceof CheckoutPricingError) {
      return createErrorResponse(error.status, error.code, error.message, timestamp, error.details);
    }

    return createErrorResponse(500, "INTERNAL_ERROR", "Failed to calculate checkout pricing preview.", timestamp);
  }
}