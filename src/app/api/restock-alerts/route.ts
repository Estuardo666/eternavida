import { NextRequest, NextResponse } from "next/server";
import { subscribeRestockAlertService } from "@/services/restock-alert/subscribe-restock-alert";
import { restockAlertRepository } from "@/server/restock-alert/restock-alert.repository";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON" }, timestamp },
        { status: 400 },
      );
    }

    const data = body as { email?: string; productId?: string };

    if (!data.email || !data.productId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "email and productId are required" }, timestamp },
        { status: 422 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid email address" }, timestamp },
        { status: 422 },
      );
    }

    const result = await subscribeRestockAlertService(data.email.toLowerCase(), data.productId);

    return NextResponse.json(
      { success: true, data: result, timestamp },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to subscribe";

    if (message === "Product not found") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message }, timestamp },
        { status: 404 },
      );
    }

    if (message === "Product is currently in stock") {
      return NextResponse.json(
        { success: false, error: { code: "IN_STOCK", message }, timestamp },
        { status: 409 },
      );
    }

    console.error("Restock alert POST error:", { error: message, timestamp });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to subscribe." }, timestamp },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const productId = searchParams.get("productId");

    if (!email || !productId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "email and productId are required" }, timestamp },
        { status: 422 },
      );
    }

    await restockAlertRepository.unsubscribe(email.toLowerCase(), productId);

    return NextResponse.json(
      { success: true, data: { unsubscribed: true }, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Restock alert DELETE error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to unsubscribe." }, timestamp },
      { status: 500 },
    );
  }
}
