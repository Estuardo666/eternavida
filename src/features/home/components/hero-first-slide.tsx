import Image from "next/image";

import type { HomeHeroSlide } from "@/types/content";

interface HeroFirstSlideProps {
  slide: HomeHeroSlide;
}

export function HeroFirstSlide({ slide }: HeroFirstSlideProps) {
  return (
    <div data-hero-static className="transition-[opacity,height] duration-300 ease-soft" aria-hidden="true">
      <section className="w-full py-4 sm:py-6 lg:py-8">
        <div className="space-y-5 lg:space-y-0">
          <div className="relative w-full overflow-hidden border-y border-border-soft bg-surface-canvas shadow-sm sm:border">
            <div className="relative min-h-[540px] sm:min-h-[620px] lg:min-h-[680px]">
              {slide.media?.url ? (
                slide.media.kind === "video" ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-soft/95 via-surface-canvas/88 to-surface-brandTint/92" />
                ) : (
                  <Image
                    src={slide.media.url}
                    alt={slide.media.altText}
                    fill
                    sizes="100vw"
                    priority
                    fetchPriority="high"
                    className="object-cover"
                  />
                )
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-brand-soft/95 via-surface-canvas/88 to-surface-brandTint/92">
                  <div
                    aria-hidden="true"
                    className="absolute right-[8%] top-[12%] h-44 w-44 rounded-full border border-white/55 bg-white/25 backdrop-blur-md lg:h-56 lg:w-56"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute bottom-[16%] right-[18%] h-32 w-32 rounded-[32px] border border-white/55 bg-white/18 backdrop-blur-md lg:h-40 lg:w-40"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute bottom-0 left-[42%] h-56 w-56 rounded-full bg-brand-accent/20 blur-3xl lg:h-72 lg:w-72"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}