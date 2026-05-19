import { NextResponse } from "next/server";

import { getActiveShippingMethods } from "@/services/checkout/get-active-shipping-methods";

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const methods = await getActiveShippingMethods();
    return NextResponse.json({ success: true, data: { methods }, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Public shipping-methods GET error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to load shipping methods." }, timestamp },
      { status: 500 },
    );
  }
}
