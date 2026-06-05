import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSubscriptionService } from "@/services/subscription/subscription.service";
import { subscriptionRepository } from "@/server/subscription/subscription.repository";
import { SUBSCRIPTION_FREQUENCIES } from "@/types/subscription";

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

    const items = await subscriptionRepository.listByUser(userId);

    return NextResponse.json(
      { success: true, data: { items }, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Subscriptions GET error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch subscriptions." }, timestamp },
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

    const data = body as { productId?: string; frequency?: string; quantity?: number };

    if (!data.productId || !data.frequency || !data.quantity) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "productId, frequency, and quantity are required" }, timestamp },
        { status: 422 },
      );
    }

    if (!SUBSCRIPTION_FREQUENCIES.includes(data.frequency as typeof SUBSCRIPTION_FREQUENCIES[number])) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid frequency" }, timestamp },
        { status: 422 },
      );
    }

    const subscription = await createSubscriptionService({
      clerkUserId: userId,
      productId: data.productId,
      frequency: data.frequency as typeof SUBSCRIPTION_FREQUENCIES[number],
      quantity: data.quantity,
    });

    return NextResponse.json(
      { success: true, data: subscription, timestamp },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create subscription";
    console.error("Subscriptions POST error:", { error: message, timestamp });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message }, timestamp },
      { status: 500 },
    );
  }
}
