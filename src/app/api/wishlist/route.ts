import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { toggleWishlistInputSchema } from "@/features/catalog/schemas/wishlist.schema";
import { wishlistRepository } from "@/server/wishlist/wishlist.repository";

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." }, timestamp },
        { status: 401 },
      );
    }

    const items = await wishlistRepository.listByUser(userId);

    return NextResponse.json(
      { success: true, data: { items }, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Wishlist GET error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch wishlist." }, timestamp },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." }, timestamp },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON" }, timestamp },
        { status: 400 },
      );
    }

    const validationResult = toggleWishlistInputSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: `Validation failed: ${errors}` }, timestamp },
        { status: 422 },
      );
    }

    const result = await wishlistRepository.toggle(userId, validationResult.data.productId);

    return NextResponse.json(
      { success: true, data: result, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Wishlist POST error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to toggle wishlist." }, timestamp },
      { status: 500 },
    );
  }
}
