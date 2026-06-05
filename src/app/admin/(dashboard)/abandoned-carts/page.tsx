import { AbandonedCartAdminPanel } from "@/features/admin-abandoned-carts/components/abandoned-cart-admin-panel";

export const metadata = {
  title: "Admin Carritos Abandonados — Dermatologika",
  description: "Configurar y monitorear recuperación de carritos abandonados.",
};

export default function AdminAbandonedCartsPage() {
  return <AbandonedCartAdminPanel />;
}
