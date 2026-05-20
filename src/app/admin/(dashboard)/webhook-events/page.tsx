import { WebhookEventsPanel } from "@/features/admin-webhooks/components/webhook-events-panel";

export const metadata = {
  title: "Admin Eventos Webhook — Dermatologika",
  description: "Revisar, filtrar y reintentar eventos de webhook enviados desde el panel de pedidos.",
};

export default function AdminWebhookEventsPage() {
  return <WebhookEventsPanel />;
}
