import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { adminUpdateReviewSchema, reviewRouteParamsSchema } from "@/features/catalog/schemas/review.schema";
import { adminUpdateReviewService, adminDeleteReviewService } from "@/services/reviews/admin-reviews";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const resolvedParams = await params;
    const paramResult = reviewRouteParamsSchema.safeParse(resolvedParams);
    if (!paramResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid id parameter" },
          timestamp,
        },
        { status: 422 },
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

    const validationResult = adminUpdateReviewSchema.safeParse(body);
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

    const review = await adminUpdateReviewService(
      paramResult.data.id,
      validationResult.data,
    );

    return NextResponse.json(
      { success: true, data: review, timestamp },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update review";

    if (message === "Review not found") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message },
          timestamp,
        },
        { status: 404 },
      );
    }

    console.error("Admin review PATCH error:", { error: message, timestamp });
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to update review." },
        timestamp,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const resolvedParams = await params;
    const paramResult = reviewRouteParamsSchema.safeParse(resolvedParams);
    if (!paramResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid id parameter" },
          timestamp,
        },
        { status: 422 },
      );
    }

    await adminDeleteReviewService(paramResult.data.id);

    return NextResponse.json(
      { success: true, data: { deleted: true }, timestamp },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete review";

    if (message === "Review not found") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message },
          timestamp,
        },
        { status: 404 },
      );
    }

    console.error("Admin review DELETE error:", { error: message, timestamp });
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to delete review." },
        timestamp,
      },
      { status: 500 },
    );
  }
}
