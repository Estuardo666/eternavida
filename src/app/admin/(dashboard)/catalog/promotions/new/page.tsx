import { PromotionAdminPanel } from "@/features/admin-promotions/components/promotion-admin-panel";
import { getPromotionAdminData } from "@/services/admin-promotions/get-promotion-admin-data";

export const metadata = {
  title: "Nueva Promoción — Eterna Vida",
  description: "Crear una nueva promoción del catálogo en una pantalla dedicada.",
};

export default async function AdminCatalogPromotionNewPage() {
  const data = await getPromotionAdminData();

  return <PromotionAdminPanel initialData={data} pageMode="create" />;
}