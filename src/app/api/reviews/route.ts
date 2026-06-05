import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createReviewInputSchema } from "@/features/catalog/schemas/review.schema";
import { createReviewService } from "@/services/reviews/create-review";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required." },
          timestamp,
        },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_JSON", message: "Request body must be valid JSON" },
          timestamp,
        },
        { status: 400 },
      );
    }

    const validationResult = createReviewInputSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: `Validation failed: ${errors}` },
          timestamp,
        },
        { status: 422 },
      );
    }

    const review = await createReviewService(validationResult.data, userId);

    return NextResponse.json(
      { success: true, data: review, timestamp },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create review";

    if (message === "Ya has reseñado este producto") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "DUPLICATE_REVIEW", message },
          timestamp,
        },
        { status: 409 },
      );
    }

    console.error("Review POST error:", { error: message, timestamp });
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create review. Please try again." },
        timestamp,
      },
      { status: 500 },
    );
  }
}
