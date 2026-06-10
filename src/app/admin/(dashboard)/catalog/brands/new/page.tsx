import { BrandAdminForm } from "@/features/admin-catalog/components/brand-admin-form";
import { getCatalogAdminData } from "@/services/admin-catalog/get-catalog-admin-data";

export const metadata = {
  title: "Admin New Brand — Eterna Vida",
  description: "Crear marca del catálogo local.",
};

export default async function AdminCatalogBrandNewPage() {
  const data = await getCatalogAdminData();

  return <BrandAdminForm initialData={data} mode="create" />;
}
