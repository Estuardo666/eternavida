import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DatafastError } from "@/server/payments/datafast/datafast.config";
import { datafastService } from "@/server/payments/datafast/datafast.service";
import { resolveClientIp } from "@/server/payments/datafast/client-ip";

const bodySchema = z.object({
  orderNumber: z.string().trim().min(1),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { orderNumber } = bodySchema.parse(await request.json());
    const result = await datafastService.startPayment(orderNumber, resolveClientIp(request));

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
    console.error("[datafast/checkout]", err);
    return NextResponse.json(
      { success: false, error: "No se pudo iniciar el pago con tarjeta." },
      { status: 500 },
    );
  }
}
