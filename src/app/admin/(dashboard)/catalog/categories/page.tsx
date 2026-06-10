import { CatalogAdminList } from "@/features/admin-catalog/components/catalog-admin-list";
import { getCategoryLibraryData } from "@/services/admin-catalog/get-catalog-admin-data";

export const metadata = {
  title: "Admin Categories — Eterna Vida",
  description: "Gestionar categorías del catálogo local.",
};

interface AdminCatalogCategoriesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminCatalogCategoriesPage({ searchParams }: AdminCatalogCategoriesPageProps) {
  const data = await getCategoryLibraryData(await searchParams);

  return (
    <CatalogAdminList libraryData={data} section="categories" />
  );
}