import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import {
  paymentMethodFormSchema,
  normalizePaymentMethodInput,
} from "@/server/payment/payment-method.schemas";
import {
  listPaymentMethods,
  createPaymentMethod,
} from "@/server/payment/payment-method.repository";

function errorResponse(status: number, code: string, message: string, timestamp: string): NextResponse {
  return NextResponse.json({ success: false, error: { code, message }, timestamp }, { status });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const methods = await listPaymentMethods();
    return NextResponse.json({ success: true, data: { methods }, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin payment-methods GET error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return errorResponse(500, "INTERNAL_ERROR", "Failed to load payment methods.", timestamp);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    let body: unknown;
    try { body = await request.json(); } catch {
      return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.", timestamp);
    }

    const result = paymentMethodFormSchema.safeParse(body);
    if (!result.success) {
      const message = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return errorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const method = await createPaymentMethod(normalizePaymentMethodInput(result.data));
    return NextResponse.json({ success: true, data: { method }, timestamp }, { status: 201 });
  } catch (error) {
    console.error("Admin payment-methods POST error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return errorResponse(500, "INTERNAL_ERROR", "Failed to create payment method.", timestamp);
  }
}
