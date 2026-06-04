import Image from "next/image";
import Link from "next/link";

import type { HomePromoBannerContent } from "@/types/content";

interface PromoCollectionSectionProps {
  content: HomePromoBannerContent;
}

export function PromoCollectionSection({ content }: PromoCollectionSectionProps) {
  return (
    <section id={content.sectionId} className="container py-8 sm:py-10 lg:py-12">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="order-1 overflow-hidden rounded-[32px] border border-border-soft shadow-sm">
          <Image
            src="/bannerpromo.jpg"
            alt="Colección promocional"
            width={800}
            height={600}
            className="h-auto w-full object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="order-2 space-y-6">
          <div className="space-y-4">
            <h2 className="text-[2.25rem] font-bold leading-tight tracking-tight text-text-primary sm:text-[2.75rem]">
              {content.title}
            </h2>
            <p className="max-w-xl text-body-md text-text-secondary">
              {content.description}
            </p>
          </div>

          <Link
            href={content.primaryCta.href}
            className="inline-flex min-h-11 items-center rounded-full bg-brand-primary px-6 py-3 text-label-md text-text-inverse transition hover:-translate-y-0.5 hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            {content.primaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
