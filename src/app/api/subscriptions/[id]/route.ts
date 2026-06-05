import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { subscriptionRepository } from "@/server/subscription/subscription.repository";
import { SUBSCRIPTION_STATUSES } from "@/types/subscription";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    const { id } = await params;
    const sub = await subscriptionRepository.findById(id);

    if (!sub || sub.clerkUserId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Subscription not found." }, timestamp },
        { status: 404 },
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

    const data = body as { status?: string };

    if (!data.status || !SUBSCRIPTION_STATUSES.includes(data.status as typeof SUBSCRIPTION_STATUSES[number])) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid status" }, timestamp },
        { status: 422 },
      );
    }

    const updated = await subscriptionRepository.updateStatus(
      id,
      data.status as typeof SUBSCRIPTION_STATUSES[number],
    );

    return NextResponse.json(
      { success: true, data: updated, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Subscription PATCH error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update subscription." }, timestamp },
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." }, timestamp },
        { status: 401 },
      );
    }

    const { id } = await params;
    const sub = await subscriptionRepository.findById(id);

    if (!sub || sub.clerkUserId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Subscription not found." }, timestamp },
        { status: 404 },
      );
    }

    await subscriptionRepository.updateStatus(id, "cancelled");

    return NextResponse.json(
      { success: true, data: { cancelled: true }, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Subscription DELETE error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to cancel subscription." }, timestamp },
      { status: 500 },
    );
  }
}
