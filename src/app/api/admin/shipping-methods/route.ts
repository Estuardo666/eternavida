import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import {
  shippingMethodFormSchema,
  normalizeShippingMethodInput,
} from "@/server/shipping/shipping-method.schemas";
import {
  listShippingMethods,
  createShippingMethod,
} from "@/server/shipping/shipping-method.repository";

function errorResponse(status: number, code: string, message: string, timestamp: string): NextResponse {
  return NextResponse.json({ success: false, error: { code, message }, timestamp }, { status });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const methods = await listShippingMethods();
    return NextResponse.json({ success: true, data: { methods }, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin shipping-methods GET error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return errorResponse(500, "INTERNAL_ERROR", "Failed to load shipping methods.", timestamp);
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

    const result = shippingMethodFormSchema.safeParse(body);
    if (!result.success) {
      const message = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return errorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const method = await createShippingMethod(normalizeShippingMethodInput(result.data));
    return NextResponse.json({ success: true, data: { method }, timestamp }, { status: 201 });
  } catch (error) {
    console.error("Admin shipping-methods POST error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return errorResponse(500, "INTERNAL_ERROR", "Failed to create shipping method.", timestamp);
  }
}
