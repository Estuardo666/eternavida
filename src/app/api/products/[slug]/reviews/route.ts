import { NextRequest, NextResponse } from "next/server";
import { listProductReviewsQuerySchema, productSlugParamsSchema } from "@/features/catalog/schemas/review.schema";
import { getProductReviewsService } from "@/services/reviews/create-review";
import { prisma } from "@/server/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const resolvedParams = await params;
    const paramResult = productSlugParamsSchema.safeParse(resolvedParams);
    if (!paramResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid slug parameter" },
          timestamp,
        },
        { status: 422 },
      );
    }

    const { searchParams } = new URL(request.url);
    const rawQuery = {
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    };

    const queryResult = listProductReviewsQuerySchema.safeParse(rawQuery);
    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid query parameters" },
          timestamp,
        },
        { status: 422 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug: paramResult.data.slug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Product not found" },
          timestamp,
        },
        { status: 404 },
      );
    }

    const result = await getProductReviewsService(
      product.id,
      queryResult.data.page,
      queryResult.data.limit,
    );

    return NextResponse.json(
      { success: true, data: result, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Product reviews GET error:", {
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
