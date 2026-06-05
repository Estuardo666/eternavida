import { NextResponse } from "next/server";
import { processSubscriptionReminders } from "@/services/subscription/subscription.service";

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const result = await processSubscriptionReminders();
    return NextResponse.json({ success: true, data: result, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Subscription cron error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process." }, timestamp },
      { status: 500 },
    );
  }
}
