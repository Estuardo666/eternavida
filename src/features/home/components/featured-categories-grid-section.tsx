import Image from "next/image";
import Link from "next/link";

import { buildCategoryHref } from "@/lib/catalog-slugs";
import type { HomeCategoryGridContent } from "@/types/content";

interface FeaturedCategoriesGridSectionProps {
  content: HomeCategoryGridContent;
}

const fallbackBottomCategories: Array<{ id: string; name: string }> = [
  { id: "miel-pura", name: "Miel pura" },
  { id: "aceite-coco", name: "Aceite de coco" },
  { id: "aceite-oregano", name: "Aceite de orégano" },
  { id: "endulzantes-naturales", name: "Endulzantes naturales" },
  { id: "cuidado-personal", name: "Cuidado personal" },
  { id: "alimentacion-saludable", name: "Alimentación saludable" },
];

export function FeaturedCategoriesGridSection({
  content,
}: FeaturedCategoriesGridSectionProps) {
  const topItems = content.items.slice(0, 3);
  const remainingItems = content.items.slice(3);
  const usedIds = new Set(content.items.map((item) => item.id));
  const fallbackItems = fallbackBottomCategories
    .filter((item) => !usedIds.has(item.id))
    .map((item) => ({
      id: item.id,
      name: item.name,
      href: buildCategoryHref(item.id),
    }));
  const bottomItems = [...remainingItems, ...fallbackItems].slice(0, 4);

  if (!content.items.length) return null;

  return (
    <section id={content.sectionId} className="w-full py-8 sm:py-10 lg:py-12">
      <div className="container space-y-8">
        <div className="text-center">
          <h2 className="text-[2.5rem] font-bold leading-tight tracking-tight text-text-primary">
            Categorías destacadas
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-body-md text-text-secondary">
            {content.description}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topItems.map((item) => (
            <Link
              key={item.id}
              href={buildCategoryHref(item.id)}
              className="group relative flex flex-col overflow-hidden rounded-[28px] border border-border-soft bg-surface-canvas shadow-xs transition hover:-translate-y-1 hover:bg-brand-primary hover:border-brand-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              <div className="relative min-h-[200px] bg-surface-soft sm:min-h-[240px]">
                {item.media?.url ? (
                  <Image
                    src={item.media.url}
                    alt={`Imagen de categoría ${item.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 95vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-brandTint via-surface-canvas to-surface-soft" />
                )}
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="text-[1.375rem] font-bold text-text-primary transition-colors group-hover:text-white">
                  {item.name}
                </span>
                <span className="text-label-md text-text-secondary transition group-hover:translate-x-0.5 group-hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {bottomItems.map((item) => (
            <Link
              key={`pill-${item.id}`}
              href={buildCategoryHref(item.id)}
              className="group flex items-center justify-between rounded-[20px] border border-border-soft bg-surface-canvas px-5 py-4 shadow-xs transition hover:-translate-y-0.5 hover:border-brand-primary hover:bg-brand-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              <span className="text-[1.375rem] font-bold text-text-primary transition-colors group-hover:text-white">{item.name}</span>
              <span className="text-label-md text-text-secondary transition group-hover:translate-x-0.5 group-hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
