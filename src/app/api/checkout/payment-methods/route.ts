import { NextResponse } from "next/server";

import { getActivePaymentMethods } from "@/services/checkout/get-active-payment-methods";

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const methods = await getActivePaymentMethods();
    return NextResponse.json({ success: true, data: { methods }, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Public payment-methods GET error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to load payment methods." }, timestamp },
      { status: 500 },
    );
  }
}
