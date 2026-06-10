import { ProductAdminForm } from "@/features/admin-catalog/components/product-admin-form";
import { getCatalogAdminData } from "@/services/admin-catalog/get-catalog-admin-data";
import { getAdminProductSyncCapabilities } from "@/services/admin-catalog/sync-product";

export const metadata = {
  title: "Admin New Product — Eterna Vida",
  description: "Crear producto del catálogo local.",
};

export default async function AdminCatalogProductNewPage() {
  const data = await getCatalogAdminData();
  const syncCapabilities = getAdminProductSyncCapabilities();

  return <ProductAdminForm initialData={data} mode="create" syncCapabilities={syncCapabilities} />;
}