import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { trackCartActivityService } from "@/services/abandoned-cart/process-recovery";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const { userId } = await auth();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON" }, timestamp },
        { status: 400 },
      );
    }

    const data = body as {
      guestEmail?: string;
      guestPhone?: string;
      items: Array<{
        id: string;
        name: string;
        brand: string;
        price: number;
        discountPrice: number | null;
        quantity: number;
        imageUrl: string | null;
      }>;
    };

    if (!data.items || !Array.isArray(data.items)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "items array is required" }, timestamp },
        { status: 422 },
      );
    }

    await trackCartActivityService({
      clerkUserId: userId,
      guestEmail: data.guestEmail ?? null,
      guestPhone: data.guestPhone ?? null,
      cartData: data.items,
    });

    return NextResponse.json(
      { success: true, data: { tracked: true }, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Cart track error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to track cart." }, timestamp },
      { status: 500 },
    );
  }
}
