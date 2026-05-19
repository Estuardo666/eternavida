import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import {
  paymentMethodFormSchema,
  normalizePaymentMethodInput,
} from "@/server/payment/payment-method.schemas";
import {
  updatePaymentMethod,
  deletePaymentMethod,
} from "@/server/payment/payment-method.repository";

function errorResponse(status: number, code: string, message: string, timestamp: string): NextResponse {
  return NextResponse.json({ success: false, error: { code, message }, timestamp }, { status });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { id } = await params;
    if (!id) return errorResponse(400, "MISSING_ID", "Payment method id is required.", timestamp);

    let body: unknown;
    try { body = await request.json(); } catch {
      return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.", timestamp);
    }

    const result = paymentMethodFormSchema.safeParse(body);
    if (!result.success) {
      const message = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return errorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const method = await updatePaymentMethod(id, normalizePaymentMethodInput(result.data));
    return NextResponse.json({ success: true, data: { method }, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin payment-methods PUT error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return errorResponse(500, "INTERNAL_ERROR", "Failed to update payment method.", timestamp);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { id } = await params;
    if (!id) return errorResponse(400, "MISSING_ID", "Payment method id is required.", timestamp);

    await deletePaymentMethod(id);
    return NextResponse.json({ success: true, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin payment-methods DELETE error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return errorResponse(500, "INTERNAL_ERROR", "Failed to delete payment method.", timestamp);
  }
}
