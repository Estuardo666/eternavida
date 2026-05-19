import { ShippingMethodAdminPanel } from "@/features/admin-shipping/components/shipping-method-admin-panel";
import { getAdminShippingMethods } from "@/services/admin-shipping/get-shipping-methods";

export const metadata = {
  title: "Admin Envío — Dermatologika",
  description: "Gestionar los métodos de envío disponibles en el checkout.",
};

export default async function AdminShippingPage() {
  const methods = await getAdminShippingMethods();
  return <ShippingMethodAdminPanel initialMethods={methods} />;
}
