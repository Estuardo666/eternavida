import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." }, timestamp }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User not found." }, timestamp }, { status: 404 });
    }

    const email = user.emailAddresses[0]?.emailAddress ?? "";
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || email;

    console.info("Account deletion request received:", { userId, email, name, timestamp });

    return NextResponse.json({ success: true, timestamp });
  } catch (error) {
    console.error("Client delete-request POST error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to send deletion request." }, timestamp }, { status: 500 });
  }
}
