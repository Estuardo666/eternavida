"use client";

import Link from "next/link";

import { PublicProductCard } from "@/features/catalog/components/public-product-card";
import type { HomeProductShelfContent } from "@/types/content";

interface FeaturedCategoryProductsSectionProps {
  content: HomeProductShelfContent;
}

export function FeaturedCategoryProductsSection({
  content,
}: FeaturedCategoryProductsSectionProps) {
  const products = content.items.slice(0, 5);
  if (!products.length) return null;

  return (
    <section className="w-full py-8 sm:py-10 lg:py-12">
      <div className="container space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-[2.5rem] font-bold leading-tight tracking-tight text-text-primary">
              Categoría destacada
            </h2>
            <p className="text-body-md text-text-secondary">
              {content.description}
            </p>
          </div>
          <Link
            href={content.cta?.href ?? "#"}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-brand-primary px-6 py-3 text-label-md text-text-inverse transition hover:-translate-y-0.5 hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            {content.cta?.label ?? "Explorar categoría"}
          </Link>
        </div>

        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[220px] shrink-0 snap-start sm:w-[240px]"
            >
              <PublicProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
