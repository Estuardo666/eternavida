import { NextResponse } from "next/server";
import { processAbandonedCartRecovery } from "@/services/abandoned-cart/process-recovery";

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const result = await processAbandonedCartRecovery();

    return NextResponse.json(
      { success: true, data: result, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Abandoned cart cron error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process abandoned carts." }, timestamp },
      { status: 500 },
    );
  }
}
