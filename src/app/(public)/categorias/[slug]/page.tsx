import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicCatalogEmptyState } from "@/features/catalog/components/public-catalog-empty-state";
import { PublicCatalogFilterSidebar } from "@/features/catalog/components/public-catalog-filter-sidebar";
import { PublicCatalogPagination } from "@/features/catalog/components/public-catalog-pagination";
import { PublicCatalogInlineBannerCard, PublicCatalogPageBanner } from "@/features/catalog/components/public-catalog-promo-banner";
import { PublicProductGrid } from "@/features/catalog/components/public-product-grid";
import { buildCategoryMetadata } from "@/seo/catalog";
import { mapBrandIdsToSlugs } from "@/services/catalog/get-public-catalog-data";
import { getPublicCategoryDetailData } from "@/services/catalog/get-public-catalog-data";

export const revalidate = 60;

interface PublicCategoryDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PublicCategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicCategoryDetailData(slug, {});

  if (!data) {
    return {
      title: "Categoría no encontrada",
    };
  }

  return buildCategoryMetadata(data.category);
}

export default async function PublicCategoryDetailPage({
  params,
  searchParams,
}: PublicCategoryDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const data = await getPublicCategoryDetailData(slug, resolvedSearchParams);

  if (!data) {
    notFound();
  }

  const normalizedSearchParams: Record<string, string> = {
    ...(data.filters.query ? { q: data.filters.query } : {}),
    ...(data.sortBy !== "recent" ? { orden: data.sortBy } : {}),
    ...(data.filters.priceMin !== null ? { precioMin: String(data.filters.priceMin) } : {}),
    ...(data.filters.priceMax !== null ? { precioMax: String(data.filters.priceMax) } : {}),
    ...(data.filters.inStock ? { enStock: "1" } : {}),
    ...(data.filters.onSale ? { enOferta: "1" } : {}),
    ...(data.filters.brandIds.length > 0 ? { marcas: mapBrandIdsToSlugs(data.filters.brandIds, data.brandOptions).join(",") } : {}),
  };

  return (
    <div className="mx-auto w-[95vw] px-[5px] py-8 sm:px-6 sm:py-12">
      <div className="space-y-8">

        {/* Full-width promo banner 1 */}
        <PublicCatalogPageBanner />

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-body-sm text-text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link
                href="/"
                className="transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle"
              >
                Inicio
              </Link>
            </li>
            <li aria-hidden="true" className="text-text-muted">/</li>
            <li>
              <Link
                href="/productos"
                className="transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle"
              >
                Tienda
              </Link>
            </li>
            <li aria-hidden="true" className="text-text-muted">/</li>
            <li aria-current="page" className="text-text-secondary">
              {data.category.name}
            </li>
          </ol>
        </nav>

        {/* Category heading */}
        <div className="space-y-3">
          <h1 className="text-headline-md text-text-primary sm:text-headline-lg">
            {data.category.name}
          </h1>
          {data.category.description ? (
            <p className="max-w-2xl text-body-md text-text-secondary">
              {data.category.description}
            </p>
          ) : null}
        </div>

        <div className="flex items-start gap-8">
          <PublicCatalogFilterSidebar
            actionPath={data.category.href}
            filters={data.filters}
            sortBy={data.sortBy}
            brandOptions={data.brandOptions}
            maxPrice={data.maxPrice}
            totalItems={data.pagination.totalItems}
            includeCategorySlugInUrl={false}
          />

          <div className="min-w-0 flex-1 space-y-6">
            {data.products.length > 0 ? (
              <>
                <PublicProductGrid
                  items={data.products}
                  mobileColumns={2}
                  layout="withSidebar"
                  id="catalog-products-top"
                  inlineBannerSlot={<PublicCatalogInlineBannerCard variant="category" />}
                  bannerPosition={0}
                />
                <PublicCatalogPagination
                  basePath={data.category.href}
                  pagination={data.pagination}
                  searchParams={normalizedSearchParams}
                />
              </>
            ) : (
              <PublicCatalogEmptyState
                title="Esta categoría todavía no tiene productos visibles"
                description="Cuando el equipo active productos en esta categoría, aparecerán aquí automáticamente."
                action={{ href: "/productos", label: "Ver toda la tienda" }}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
