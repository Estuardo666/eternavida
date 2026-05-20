import { EmailSettingsAdminPanel } from "@/features/admin-emails/components/email-settings-admin-panel";
import { getEmailSettings } from "@/services/email/get-email-settings";

export const metadata = {
  title: "Admin Correos — Dermatologika",
  description: "Gestionar remitentes, destinatarios de prueba y pruebas de correos transaccionales.",
};

export default async function AdminEmailSettingsPage() {
  const settings = await getEmailSettings();

  return (
    <EmailSettingsAdminPanel
      initialSettings={{
        adminEmails: settings.adminEmails,
        testMode: settings.testMode,
        testEmails: settings.testEmails,
        fromName: settings.fromName,
        fromEmail: settings.fromEmail,
        replyTo: settings.replyTo ?? "",
      }}
    />
  );
}