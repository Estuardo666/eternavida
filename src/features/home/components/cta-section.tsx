import Image from "next/image";

import { PublicLinkButton } from "@/components/ui/public-link-button";
import type { HomeCtaSectionContent } from "@/types/content";

interface CtaSectionProps {
  content: HomeCtaSectionContent;
}

export function CtaSection({ content }: CtaSectionProps) {
  return (
    <section id={content.sectionId} className="container py-12 sm:py-16 lg:py-20">
      <div className="relative overflow-hidden rounded-[36px] border border-border-brand p-6 shadow-sm sm:p-8 lg:p-10">
        <Image
          src="/media/new dev media/48159.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-white/75 backdrop-blur-[1px]" />

        <div className="relative mx-auto max-w-4xl space-y-6 text-center">
          <span className="inline-flex rounded-pill border border-border-brand bg-surface-canvas/90 px-3 py-1 text-caption uppercase tracking-[0.14em] text-text-brand">
            {content.eyebrow}
          </span>
          <div className="space-y-4">
            <h2 className="text-headline-sm text-text-primary sm:text-headline-md lg:text-headline-lg">
              {content.title}
            </h2>
            <p className="mx-auto max-w-2xl text-body-md text-text-secondary">{content.description}</p>
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
