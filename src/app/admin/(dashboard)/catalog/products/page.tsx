import { CatalogAdminList } from "@/features/admin-catalog/components/catalog-admin-list";
import { getProductLibraryData } from "@/services/admin-catalog/get-catalog-admin-data";

export const metadata = {
  title: "Admin Products — Eterna Vida",
  description: "Gestionar productos del catálogo local.",
};

interface AdminCatalogProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminCatalogProductsPage({ searchParams }: AdminCatalogProductsPageProps) {
  const data = await getProductLibraryData(await searchParams);

  return (
    <CatalogAdminList libraryData={data} section="products" />
  );
}