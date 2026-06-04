"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useState } from "react";

import { cx } from "@/lib/utils";
import type { HomeHeroContent, HomeHeroSlide } from "@/types/content";

interface HeroSectionProps {
  content: HomeHeroContent;
}

interface HeroSlideMediaProps {
  slide: HomeHeroSlide;
  isActive: boolean;
  shouldPrioritize: boolean;
  shouldRenderMedia: boolean;
}

function HeroSlideMedia({ slide, isActive, shouldPrioritize, shouldRenderMedia }: HeroSlideMediaProps) {
  if (!slide.media?.url) {
    return (
      <div
        className={cx(
          "absolute inset-0 transition-opacity duration-slow ease-soft",
          isActive ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-soft/95 via-surface-canvas/88 to-surface-brandTint/92" />
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
    );
  }

  return (
    <div
      className={cx(
        "absolute inset-0 overflow-hidden transition-opacity duration-slow ease-soft",
        isActive ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {slide.media.kind === "video" ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay={isActive}
          muted
          loop
          playsInline
          preload={isActive ? "metadata" : "none"}
          aria-label={slide.media.altText}
          poster={slide.media.posterUrl ?? undefined}
        >
          {shouldRenderMedia ? <source src={slide.media.url} type={slide.media.mimeType ?? undefined} /> : null}
        </video>
      ) : (
        shouldRenderMedia ? (
          <Image
            src={slide.media.url}
            alt={slide.media.altText}
            fill
            sizes="100vw"
            priority={shouldPrioritize}
            loading={shouldPrioritize ? "eager" : "lazy"}
            fetchPriority={shouldPrioritize ? "high" : "auto"}
            className="object-cover"
          />
        ) : null
      )}

    </div>
  );
}

export function HeroSection({ content }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const totalSlides = content.slides.length;
  const activeSlide = content.slides[activeIndex] ?? content.slides[0];

  const goToSlide = (nextIndex: number) => {
    setActiveIndex((nextIndex + totalSlides) % totalSlides);
  };

  const showNextSlide = useEffectEvent(() => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % totalSlides);
  });

  useEffect(() => {
    if (totalSlides < 2) {
      return undefined;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      showNextSlide();
    }, 6500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [totalSlides]);

  if (!activeSlide) {
    return null;
  }

  return (
    <section className="w-full py-4 sm:py-6 lg:py-8">
      <div className="space-y-5 lg:space-y-0">
        <div className="relative w-full overflow-hidden border-y border-border-soft bg-surface-canvas shadow-md sm:border">
          <div className="relative min-h-[540px] sm:min-h-[620px] lg:min-h-[680px]">
            {content.slides.map((slide, index) => (
              <HeroSlideMedia
                key={slide.id}
                slide={slide}
                isActive={index === activeIndex}
                shouldPrioritize={index === 0}
                shouldRenderMedia={Math.abs(index - activeIndex) <= 1 || (activeIndex === 0 && index === totalSlides - 1) || (activeIndex === totalSlides - 1 && index === 0)}
              />
            ))}

            <div className="sr-only" aria-live="polite">
              <p>{activeSlide.announcement}</p>
              <p>{activeSlide.eyebrow}</p>
              <h1>{activeSlide.title}</h1>
              <p>{activeSlide.subtitle}</p>
              <p>{activeSlide.supportingBadge}</p>
            </div>
          </div>
        </div>

        {totalSlides > 1 ? (
          <div className="container flex items-center justify-center gap-3 py-2">
            <button
              type="button"
              onClick={() => goToSlide(activeIndex - 1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-default bg-surface-canvas text-label-lg text-text-primary transition hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
              aria-label="Mostrar banner anterior"
            >
              ←
            </button>

            <div className="flex items-center justify-center gap-2" aria-hidden="true">
              {content.slides.map((slide, index) => (
                <span
                  key={slide.id}
                  className={
                    index === activeIndex
                      ? "h-1.5 w-8 rounded-full bg-text-primary"
                      : "h-1.5 w-4 rounded-full bg-border-strong"
                  }
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => goToSlide(activeIndex + 1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-default bg-surface-canvas text-label-lg text-text-primary transition hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
              aria-label="Mostrar siguiente banner"
            >
              →
            </button>
          </div>
        ) : null}

      </div>
    </section>
  );
}
