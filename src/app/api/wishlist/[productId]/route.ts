import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { wishlistRepository } from "@/server/wishlist/wishlist.repository";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." }, timestamp },
        { status: 401 },
      );
    }

    const { productId } = await params;
    if (!productId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Product ID is required" }, timestamp },
        { status: 422 },
      );
    }

    await wishlistRepository.delete(userId, productId);

    return NextResponse.json(
      { success: true, data: { deleted: true }, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Wishlist DELETE error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to remove from wishlist." }, timestamp },
      { status: 500 },
    );
  }
}
