import "server-only";
import { welcomeUserTemplate } from "@/server/email/templates/welcome-user.template";
import { sendTransactionalEmail } from "@/server/email/email-sender.service";

export async function sendWelcomeEmail(user: {
  email: string;
  firstName: string;
}) {
  const html = welcomeUserTemplate(user);

  return sendTransactionalEmail({
    to: user.email,
    templateKey: "welcome_user",
    subject: "¡Bienvenida a Eterna Vida!",
    html,
    metadata: { email: user.email },
  });
}
