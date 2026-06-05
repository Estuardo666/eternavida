import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { listReviewsQuerySchema } from "@/features/catalog/schemas/review.schema";
import { listAdminReviewsService } from "@/services/reviews/admin-reviews";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const rawQuery = {
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    };

    const validationResult = listReviewsQuerySchema.safeParse(rawQuery);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: `Invalid query parameters: ${errors}` },
          timestamp,
        },
        { status: 422 },
      );
    }

    const result = await listAdminReviewsService(validationResult.data);

    return NextResponse.json(
      { success: true, data: result, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin reviews GET error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch reviews." },
        timestamp,
      },
      { status: 500 },
    );
  }
}
