"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicProductBenefitSummary } from "@/types/public-catalog";
import { getBenefitIcon } from "@/lib/product-benefit-icons";
import { cfImageLoader } from "@/lib/cf-image-loader";
import { motionTokens } from "@/motion/tokens";

interface BenefitCardScrollProps {
  benefits: PublicProductBenefitSummary[];
}

const CARD_WIDTH = 130;
const GAP = 8;
const VISIBLE_CARDS = 3;

export function BenefitCardScroll({ benefits }: BenefitCardScrollProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const maxIndex = Math.max(0, benefits.length - VISIBLE_CARDS);

  const goNext = useCallback(() => {
    if (activeIndex >= maxIndex) return;
    setDirection(1);
    setActiveIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [activeIndex, maxIndex]);

  const goPrev = useCallback(() => {
    if (activeIndex <= 0) return;
    setDirection(-1);
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  }, [activeIndex]);

  if (benefits.length === 0) return null;

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? (CARD_WIDTH + GAP) : -(CARD_WIDTH + GAP),
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -(CARD_WIDTH + GAP) : (CARD_WIDTH + GAP),
      opacity: 0,
    }),
  };

  const slideTransition = {
    duration: prefersReducedMotion ? 0 : motionTokens.duration.moderate,
    ease: motionTokens.ease.soft,
  };

  return (
    <div className="mt-6">
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="flex gap-3"
          >
            {benefits.slice(activeIndex, activeIndex + VISIBLE_CARDS).map((benefit) => {
              const iconDef = getBenefitIcon(benefit.iconKey) ?? getBenefitIcon("check-circle");
              return (
                <motion.div
                  key={benefit.id}
                  whileHover={prefersReducedMotion ? {} : { y: -3, scale: 1.03 }}
                  transition={{ duration: motionTokens.duration.fast, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex w-[130px] flex-shrink-0 cursor-default flex-col items-center gap-1.5 rounded-2xl border border-border-soft bg-surface-canvas p-2.5"
                >
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-surface-tertiary">
                    {benefit.media?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cfImageLoader({ src: benefit.media.url, width: 128, quality: 75 })}
                        alt={benefit.text}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : iconDef ? (
                      <svg
                        viewBox={iconDef.viewBox}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-7 w-7 text-brand-primary"
                      >
                        {iconDef.paths.map((d, i) => (
                          <path key={i} d={d} />
                        ))}
                      </svg>
                    ) : null}
                  </div>
                  <p className="text-center text-[0.86rem] font-medium leading-snug text-text-primary">
                    {benefit.text}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {benefits.length > VISIBLE_CARDS && (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={activeIndex <= 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur-sm transition-colors hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4 text-text-primary" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={activeIndex >= maxIndex}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur-sm transition-colors hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4 text-text-primary" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {benefits.length > VISIBLE_CARDS && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setDirection(index > activeIndex ? 1 : -1);
                setActiveIndex(index);
              }}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                index === activeIndex
                  ? "bg-brand-primary w-3"
                  : "bg-border-medium hover:bg-border-strong"
              }`}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
