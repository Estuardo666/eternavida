import type { Metadata } from "next";

import { PublicCatalogEmptyState } from "@/features/catalog/components/public-catalog-empty-state";
import { PublicCategoryCard } from "@/features/catalog/components/public-category-card";
import { buildCategoryIndexMetadata } from "@/seo/catalog";
import { getPublicCategoryCatalogData } from "@/services/catalog/get-public-catalog-data";

export const revalidate = 60;

export const metadata: Metadata = buildCategoryIndexMetadata();

export default async function PublicCategoriesPage() {
  const data = await getPublicCategoryCatalogData();

  return (
    <div className="mx-auto w-full max-w-[85vw] px-[5px] py-8 sm:px-6 sm:py-12">
      <div className="space-y-8">
        <section className="space-y-4">
          <span className="inline-flex rounded-pill border border-border-brand bg-brand-soft px-3 py-1 text-caption uppercase tracking-[0.14em] text-text-brand">
            Catalogo publico
          </span>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-headline-md text-text-primary sm:text-headline-lg">
              Categorias activas del storefront Eterna Vida
            </h1>
            <p className="text-body-md text-text-secondary">
              Explora el catalogo local normalizado por lineas y rutas de navegacion preparadas para el storefront publico.
            </p>
          </div>
        </section>

        {data.items.length > 0 ? (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((category) => (
              <li key={category.id}>
                <PublicCategoryCard category={category} />
              </li>
            ))}
          </ul>
        ) : (
          <PublicCatalogEmptyState
            title="Todavia no hay categorias publicas activas"
            description="Cuando el equipo active categorias desde el catalogo interno, apareceran aqui con sus productos asociados."
            action={{ href: "/", label: "Volver al inicio" }}
          />
        )}
      </div>
    </div>
  );
}