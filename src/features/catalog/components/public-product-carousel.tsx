"use client";

import { useCallback, useRef, useState } from "react";

import { motion, useReducedMotion } from "framer-motion";

import { motionTokens } from "@/motion/tokens";
import type { PublicCatalogProductSummary } from "@/types/public-catalog";

import { PublicProductCard } from "./public-product-card";
import { PublicProductGrid } from "./public-product-grid";

interface PublicProductCarouselProps {
  items: PublicCatalogProductSummary[];
  maxItems?: number;
}

const ITEMS_PER_SLIDE = 2;

export function PublicProductCarousel({ items, maxItems }: PublicProductCarouselProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  // On md+ we fall back to the standard grid — carousel is mobile only
  const totalSlides = Math.ceil(displayItems.length / ITEMS_PER_SLIDE);
  const [activeSlide, setActiveSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    setActiveSlide(index);
    const track = trackRef.current;
    if (!track) return;
    const slideWidth = track.offsetWidth;
    track.scrollTo({ left: slideWidth * index, behavior: reduceMotion ? "auto" : "smooth" });
  }, [reduceMotion]);

  // Sync bullet on manual scroll
  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slideWidth = track.offsetWidth;
    if (slideWidth === 0) return;
    const nearest = Math.round(track.scrollLeft / slideWidth);
    setActiveSlide(Math.min(nearest, totalSlides - 1));
  }, [totalSlides]);

  return (
    <>
      {/* ── Mobile carousel ── */}
      <div className="md:hidden">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: "none" }}
          aria-label="Carrusel de productos"
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => {
            const slideItems = displayItems.slice(
              slideIndex * ITEMS_PER_SLIDE,
              slideIndex * ITEMS_PER_SLIDE + ITEMS_PER_SLIDE,
            );
            return (
              <div
                key={slideIndex}
                className="grid w-full shrink-0 snap-start grid-cols-2 gap-3 pr-0"
                aria-label={`Diapositiva ${slideIndex + 1} de ${totalSlides}`}
              >
                {slideItems.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: motionTokens.distance.xs }}
                    whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{
                      duration: motionTokens.duration.base,
                      delay: i * 0.06,
                      ease: motionTokens.ease.standard,
                    }}
                  >
                    <PublicProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Bullets */}
        {totalSlides > 1 ? (
          <div
            className="mt-4 flex items-center justify-center gap-2"
            role="group"
            aria-label="Indicadores de diapositiva"
          >
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir a diapositiva ${i + 1}`}
                aria-current={i === activeSlide ? "true" : undefined}
                className={[
                  "h-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                  i === activeSlide
                    ? "w-5 bg-brand-primary"
                    : "w-2 bg-neutral-300 hover:bg-neutral-400",
                ].join(" ")}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* ── Desktop grid (md+) ── */}
      <div className="hidden md:block">
        <PublicProductGrid items={displayItems} />
      </div>
    </>
  );
}
