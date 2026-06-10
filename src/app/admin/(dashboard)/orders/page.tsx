import { OrderAdminPanel } from "@/features/admin-orders/components/order-admin-panel";

export const metadata = {
  title: "Admin Pedidos — Eterna Vida",
  description: "Gestionar pedidos y disparar notificaciones de estado desde el panel administrativo.",
};

export default function AdminOrdersPage() {
  return <OrderAdminPanel />;
}