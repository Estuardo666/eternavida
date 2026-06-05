import { SubscriptionAdminPanel } from "@/features/admin-subscriptions/components/subscription-admin-panel";

export const metadata = {
  title: "Admin Suscripciones — Dermatologika",
  description: "Gestionar suscripciones de reposición automática.",
};

export default function AdminSubscriptionsPage() {
  return <SubscriptionAdminPanel />;
}
