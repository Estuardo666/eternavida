import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { clerkClient } from "@clerk/nextjs/server";

type ClerkUserCreatedEvent = {
  type: "user.created";
  data: { id: string };
};

type ClerkWebhookEvent = ClerkUserCreatedEvent | { type: string; data: unknown };

export async function POST(request: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await request.text();

  const wh = new Webhook(webhookSecret);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "user.created") {
    const userId = (event as ClerkUserCreatedEvent).data.id;

    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { role: "cliente" },
      });

      try {
        const user = await client.users.getUser(userId);
        const emailAddress = user.primaryEmailAddress?.emailAddress;

        if (emailAddress) {
          const { sendWelcomeEmail } = await import("@/services/email/send-welcome-email");
          await sendWelcomeEmail({
            email: emailAddress,
            firstName: user.firstName ?? user.username ?? "Cliente",
          });
        }
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
    } catch (error) {
      console.error("Failed to set user role:", error);
      return NextResponse.json({ error: "Failed to set user role" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
