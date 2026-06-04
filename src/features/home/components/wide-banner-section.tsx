import Image from "next/image";
import Link from "next/link";

import type { HomePromoBannerContent } from "@/types/content";

interface WideBannerSectionProps {
  content: HomePromoBannerContent;
}

export function WideBannerSection({ content }: WideBannerSectionProps) {
  return (
    <section id={content.sectionId} className="container py-4 sm:py-6">
      <Link
        href={content.primaryCta.href}
        className="group block overflow-hidden rounded-[32px] border border-border-soft shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        <Image
          src="/bannerpromo3.png"
          alt="Banner promocional"
          width={1200}
          height={400}
          className="h-auto w-full object-cover"
          sizes="100vw"
        />
      </Link>
    </section>
  );
}
