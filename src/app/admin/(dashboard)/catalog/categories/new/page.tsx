import { CategoryAdminForm } from "@/features/admin-catalog/components/category-admin-form";
import { getCatalogAdminData } from "@/services/admin-catalog/get-catalog-admin-data";

export const metadata = {
  title: "Admin New Category — Eterna Vida",
  description: "Crear categoría del catálogo local.",
};

export default async function AdminCatalogCategoryNewPage() {
  const data = await getCatalogAdminData();

  return <CategoryAdminForm initialData={data} mode="create" />;
}