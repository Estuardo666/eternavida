import { RestockAlertAdminPanel } from "@/features/admin-restock-alerts/components/restock-alert-admin-panel";

export const metadata = {
  title: "Admin Alertas de Restock — Dermatologika",
  description: "Gestionar alertas de reposición de productos.",
};

export default function AdminRestockAlertsPage() {
  return <RestockAlertAdminPanel />;
}
