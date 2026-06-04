import type { Metadata } from "next";
import Link from "next/link";

import { PublicBrandHorizontalNav } from "@/features/catalog/components/public-brand-horizontal-nav";
import { PublicCatalogEmptyState } from "@/features/catalog/components/public-catalog-empty-state";
import { PublicCatalogFilterSidebar } from "@/features/catalog/components/public-catalog-filter-sidebar";
import { PublicCatalogPagination } from "@/features/catalog/components/public-catalog-pagination";
import { PublicCategoryHorizontalNav } from "@/features/catalog/components/public-category-horizontal-nav";
import { PublicProductGrid } from "@/features/catalog/components/public-product-grid";
import { buildProductIndexMetadata } from "@/seo/catalog";
import { mapBrandIdsToSlugs } from "@/services/catalog/get-public-catalog-data";
import { getPublicProductCatalogData } from "@/services/catalog/get-public-catalog-data";

export const metadata: Metadata = buildProductIndexMetadata();

interface PublicProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PublicProductsPage({ searchParams }: PublicProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getPublicProductCatalogData(resolvedSearchParams);
  const searchQuery = data.filters.query.trim();
  const isSearchResultsMode = searchQuery.length > 0;

  const normalizedSearchParams: Record<string, string> = {
    ...(data.filters.query ? { q: data.filters.query } : {}),
    ...(data.filters.categorySlug ? { categoria: data.filters.categorySlug } : {}),
    ...(data.sortBy !== "recent" ? { orden: data.sortBy } : {}),
    ...(data.filters.priceMin !== null ? { precioMin: String(data.filters.priceMin) } : {}),
    ...(data.filters.priceMax !== null ? { precioMax: String(data.filters.priceMax) } : {}),
    ...(data.filters.inStock ? { enStock: "1" } : {}),
    ...(data.filters.onSale ? { enOferta: "1" } : {}),
    ...(data.filters.brandIds.length > 0 ? { marcas: mapBrandIdsToSlugs(data.filters.brandIds, data.brandOptions).join(",") } : {}),
  };

  const headingTitle = isSearchResultsMode
    ? `Resultados para: "${searchQuery}"`
    : "Tienda Dermatologika";
  const headingDescription = isSearchResultsMode
    ? "Explora los productos que coinciden con tu búsqueda y ajusta los filtros para encontrar justo lo que necesitas."
    : "Descubre nuestra selección de productos dermatológicos. Cuidado de la piel respaldado por especialistas.";
  const emptyStateTitle = isSearchResultsMode
    ? `No encontramos resultados para: "${searchQuery}"`
    : "No encontramos productos disponibles";
  const emptyStateDescription = isSearchResultsMode
    ? "Prueba con otro término de búsqueda o ajusta los filtros para ver más resultados."
    : "Vuelve pronto o explora nuestras categorías para encontrar lo que buscas.";

  return (
    <div className="w-full">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="mx-auto w-[95vw] px-[5px] pb-6 pt-8 sm:px-6 sm:pt-10">
        <div className="space-y-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="text-body-sm text-text-muted">
            <ol className="flex flex-wrap items-center justify-center gap-1.5">
              <li>
                <Link
                  href="/"
                  className="transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle"
                >
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true" className="text-text-muted">/</li>
              <li aria-current="page" className="text-text-secondary">
                Tienda
              </li>
              {isSearchResultsMode ? (
                <>
                  <li aria-hidden="true" className="text-text-muted">/</li>
                  <li aria-current="page" className="text-text-secondary">
                    Resultados
                  </li>
                </>
              ) : null}
            </ol>
          </nav>

          {/* Page heading */}
          <div className="space-y-3 text-center">
            <h1 className="text-headline-md text-text-primary sm:text-headline-lg">
              {headingTitle}
            </h1>
            <p className="mx-auto max-w-xl text-body-md text-text-secondary">
              {headingDescription}
            </p>
          </div>
        </div>
      </div>

      {/* ── Catalog navs — full width above the sidebar+grid row ─────────── */}
      {!isSearchResultsMode ? (
        <div className="mx-auto w-[95vw] space-y-4 px-[5px] pb-6 sm:px-6">
          <PublicCategoryHorizontalNav categories={data.categoryOptions} />
          <PublicBrandHorizontalNav brands={data.brandOptions} />
        </div>
      ) : null}

      {/* ── Catalog body: sidebar + grid ────────────────────────────────── */}
      <div className="mx-auto w-[95vw] px-[5px] pb-16 sm:px-6">
        <div className="flex items-start gap-8">

          {/* Filter sidebar — renders desktop sticky rail + mobile FAB + modal */}
          <PublicCatalogFilterSidebar
            actionPath="/productos"
            filters={data.filters}
            sortBy={data.sortBy}
            brandOptions={data.brandOptions}
            maxPrice={data.maxPrice}
            totalItems={data.pagination.totalItems}
          />

          {/* Right column: grid + pagination */}
          <div className="min-w-0 flex-1 space-y-6">

            {data.items.length > 0 ? (
              <>
                <PublicProductGrid
                  items={data.items}
                  mobileColumns={2}
                  layout="withSidebar"
                  id="catalog-products-top"
                />
                <PublicCatalogPagination
                  basePath="/productos"
                  pagination={data.pagination}
                  searchParams={normalizedSearchParams}
                />
              </>
            ) : (
              <PublicCatalogEmptyState
                title={emptyStateTitle}
                description={emptyStateDescription}
                action={{ href: "/productos", label: "Ver toda la tienda" }}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
