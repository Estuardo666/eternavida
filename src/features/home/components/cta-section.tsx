import Image from "next/image";

import { PublicLinkButton } from "@/components/ui/public-link-button";
import type { HomeCtaSectionContent } from "@/types/content";

interface CtaSectionProps {
  content: HomeCtaSectionContent;
}

export function CtaSection({ content }: CtaSectionProps) {
  return (
    <section id={content.sectionId} className="relative w-full overflow-hidden bg-[#0F2A21]">
      <Image
        src="/media/new dev media/48159.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover opacity-25"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#0F2A21]/85" />

      <div className="container relative py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <span className="inline-flex rounded-pill border border-white/25 bg-white/10 px-3 py-1 text-caption uppercase tracking-[0.14em] text-emerald-200">
            {content.eyebrow}
          </span>
          <div className="space-y-4">
            <h2 className="text-headline-sm text-brand-goldLight sm:text-headline-md lg:text-headline-lg">
              {content.title}
            </h2>
            <p className="mx-auto max-w-2xl text-body-md text-white/70">{content.description}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <PublicLinkButton action={content.primaryCta} variant="primary" />
            {content.secondaryCta ? (
              <PublicLinkButton action={content.secondaryCta} variant="secondary" />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
