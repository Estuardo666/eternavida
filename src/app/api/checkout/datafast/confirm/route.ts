import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DatafastError } from "@/server/payments/datafast/datafast.config";
import { datafastService } from "@/server/payments/datafast/datafast.service";

const bodySchema = z.object({
  orderNumber: z.string().trim().min(1),
  resourcePath: z.string().trim().min(1),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { orderNumber, resourcePath } = bodySchema.parse(await request.json());
    const result = await datafastService.confirmPayment(orderNumber, resourcePath);

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Datos invalidos", details: err.issues },
        { status: 400 },
      );
    }
    if (err instanceof DatafastError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
    console.error("[datafast/confirm]", err);
    return NextResponse.json(
      { success: false, error: "No se pudo verificar el pago." },
      { status: 500 },
    );
  }
}
