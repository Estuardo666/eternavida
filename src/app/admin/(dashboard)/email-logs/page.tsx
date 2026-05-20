import { EmailLogsAdminPanel } from "@/features/admin-emails/components/email-logs-admin-panel";

export const metadata = {
  title: "Admin Logs de correos — Dermatologika",
  description: "Revisar estado y trazabilidad de los correos transaccionales enviados por el sistema.",
};

export default function AdminEmailLogsPage() {
  return <EmailLogsAdminPanel />;
}