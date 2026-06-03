import Link from "next/link";

import { PublicProductCard } from "@/features/catalog/components/public-product-card";
import { SectionHeading } from "@/features/home/components/section-heading";
import { cx } from "@/lib/utils";
import type { HomeProductShelfContent } from "@/types/content";

interface ProductShelfSectionProps {
  content: HomeProductShelfContent;
  variant?: "default" | "soft" | "featured";
}

export function ProductShelfSection({
  content,
  variant = "default",
}: ProductShelfSectionProps) {
  if (variant === "featured") {
    return (
      <section id={content.sectionId} className="w-full py-4 sm:py-6 lg:py-8">
        <div className="w-full bg-surface-canvas py-10 sm:py-12 lg:py-14">
          <div className="container space-y-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <span className="inline-flex rounded-pill border border-border-default bg-surface-subtle px-4 py-2 text-caption uppercase tracking-[0.14em] text-text-secondary">
                  Línea de producto conectada al hero
                </span>
                <SectionHeading
                  eyebrow={content.eyebrow}
                  title={content.title}
                  description={content.description}
                />
              </div>

              {content.cta ? (
                <Link
                  href={content.cta.href}
                  className="inline-flex min-h-11 items-center rounded-pill bg-brand-primary px-5 py-3 text-label-md text-text-inverse transition hover:-translate-y-0.5 hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
                >
                  {content.cta.label}
                </Link>
              ) : null}
            </div>

            <ul className="grid grid-flow-col auto-cols-[84%] gap-5 overflow-x-auto pb-2 sm:auto-cols-[46%] lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-4 lg:overflow-visible">
              {content.items.map((item) => (
                <li key={item.id} className="min-w-0">
                  <PublicProductCard product={item} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={content.sectionId}
      className={cx("py-12 sm:py-16", variant === "soft" && "bg-surface-canvas")}
    >
      <div className="container space-y-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow={content.eyebrow}
              title={content.title}
              description={content.description}
            />
          </div>

          {content.cta ? (
            <Link
              href={content.cta.href}
              className="inline-flex min-h-11 items-center rounded-pill bg-brand-primary px-5 py-3 text-label-md text-text-inverse transition hover:-translate-y-0.5 hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
            >
              {content.cta.label}
            </Link>
          ) : null}
        </div>

        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {content.items.map((item) => (
            <li key={item.id}>
              <PublicProductCard product={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}