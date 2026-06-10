import { PromotionAdminPanel } from "@/features/admin-promotions/components/promotion-admin-panel";
import { getPromotionAdminData } from "@/services/admin-promotions/get-promotion-admin-data";

export const metadata = {
  title: "Admin Promociones — Eterna Vida",
  description: "Gestionar promociones, descuentos y reglas de envío del catálogo.",
};

export default async function AdminCatalogPromotionsPage() {
  const data = await getPromotionAdminData();

  return <PromotionAdminPanel initialData={data} />;
}