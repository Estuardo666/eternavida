"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicProductGalleryImageSummary } from "@/types/public-catalog";
import type { MediaAsset } from "@/types/media";
import { motionTokens } from "@/motion/tokens";

interface ProductImageGalleryProps {
  primaryImage: MediaAsset | null;
  galleryImages: PublicProductGalleryImageSummary[];
  productName: string;
}

interface GalleryImage {
  id: string;
  url: string | null;
  altText: string | null;
}

function buildGalleryList(
  primaryImage: MediaAsset | null,
  galleryImages: PublicProductGalleryImageSummary[],
): GalleryImage[] {
  const images: GalleryImage[] = [];

  if (primaryImage?.url) {
    images.push({
      id: `primary-${primaryImage.id}`,
      url: primaryImage.url,
      altText: primaryImage.altText,
    });
  }

  for (const g of galleryImages) {
    if (g.media?.url) {
      images.push({
        id: g.id,
        url: g.media.url,
        altText: g.media.altText,
      });
    }
  }

  return images;
}

export function ProductImageGallery({ primaryImage, galleryImages, productName }: ProductImageGalleryProps) {
  const allImages = buildGalleryList(primaryImage, galleryImages);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const goTo = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
    },
    [activeIndex],
  );

  const goNext = useCallback(() => {
    if (allImages.length <= 1) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const goPrev = useCallback(() => {
    if (allImages.length <= 1) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  if (allImages.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-surface-tertiary">
        <span className="text-4xl font-light text-text-tertiary">
          {productName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const slideTransition = {
    duration: prefersReducedMotion ? 0 : motionTokens.duration.moderate,
    ease: motionTokens.ease.soft,
  };

  return (
    <div className="flex gap-3">
      {/* Thumbnail strip */}
      {allImages.length > 1 && (
        <div className="hidden flex-col gap-2 sm:flex">
          {allImages.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => goTo(index)}
              className={`h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                index === activeIndex
                  ? "border-brand-primary"
                  : "border-transparent hover:border-border-medium"
              }`}
            >
              {img.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.url}
                  alt={img.altText || `${productName} thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main carousel */}
      <div className="relative flex-1">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-tertiary">
          {allImages[activeIndex] && (
            <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                key={allImages[activeIndex].id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="absolute inset-0 flex items-center justify-center"
              >
                {allImages[activeIndex].url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={allImages[activeIndex].url!}
                    alt={allImages[activeIndex].altText || productName}
                    className="h-full w-full rounded-2xl object-cover"
                    loading={activeIndex === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Navigation arrows */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 text-text-primary" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 text-text-primary" />
              </button>
            </>
          )}
        </div>

        {/* Dot indicators */}
        {allImages.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {allImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "bg-brand-primary scale-110"
                    : "bg-border-medium hover:bg-border-strong"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
