import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import {
  shippingMethodFormSchema,
  normalizeShippingMethodInput,
} from "@/server/shipping/shipping-method.schemas";
import {
  updateShippingMethod,
  deleteShippingMethod,
} from "@/server/shipping/shipping-method.repository";

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
    if (!id) return errorResponse(400, "MISSING_ID", "Shipping method id is required.", timestamp);

    let body: unknown;
    try { body = await request.json(); } catch {
      return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.", timestamp);
    }

    const result = shippingMethodFormSchema.safeParse(body);
    if (!result.success) {
      const message = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return errorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const method = await updateShippingMethod(id, normalizeShippingMethodInput(result.data));
    return NextResponse.json({ success: true, data: { method }, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin shipping-methods PUT error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return errorResponse(500, "INTERNAL_ERROR", "Failed to update shipping method.", timestamp);
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
    if (!id) return errorResponse(400, "MISSING_ID", "Shipping method id is required.", timestamp);

    await deleteShippingMethod(id);
    return NextResponse.json({ success: true, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin shipping-methods DELETE error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return errorResponse(500, "INTERNAL_ERROR", "Failed to delete shipping method.", timestamp);
  }
}
