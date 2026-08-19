import Image from "next/image";
import Link from "next/link";

import type { HomePromoBannerContent } from "@/types/content";

interface PromoCollectionSectionProps {
  content: HomePromoBannerContent;
}

export function PromoCollectionSection({ content }: PromoCollectionSectionProps) {
  return (
    <section id={content.sectionId} className="w-full bg-[#0F2A21] py-12 sm:py-16 lg:py-20">
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="order-1 overflow-hidden rounded-[32px] border border-white/10">
            <Image
              src="/media/new dev media/1107.jpg"
              alt="Eterna Vida - Productos con propósito"
              width={800}
              height={600}
              className="h-auto w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="order-2 space-y-6">
            <div className="space-y-4">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400/80 sm:text-xs">
                {content.eyebrow}
              </span>
              <h2 className="text-[2.25rem] font-bold leading-tight tracking-tight text-brand-goldLight sm:text-[2.75rem]">
                {content.title}
              </h2>
              <p className="max-w-xl text-body-md text-white/70">
                {content.description}
              </p>
            </div>

            <Link
              href={content.primaryCta.href}
              className="inline-flex min-h-11 items-center rounded-full bg-white px-6 py-3 text-label-md text-[#0F2A21] transition hover:-translate-y-0.5 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F2A21]"
            >
              {content.primaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
