import { WebhookConfigPanel } from "@/features/admin-webhooks/components/webhook-config-panel";

export const metadata = {
  title: "Admin Webhooks — Eterna Vida",
  description: "Configurar la integracion de webhooks para pedidos y eventos hacia una API externa.",
};

export default function AdminWebhookConfigPage() {
  return <WebhookConfigPanel />;
}
