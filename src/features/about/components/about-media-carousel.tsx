"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { motionTokens } from "@/motion/tokens";
import type { MediaAsset } from "@/types/media";

interface AboutMediaCarouselProps {
  media: MediaAsset | null;
  alt: string;
  autoPlayMs?: number;
  className?: string;
}

const PLACEHOLDER_IMAGES = [
  "https://pub-cc734373dc1544418e5ba00681e8514f.r2.dev/media/imagen.jpg",
  "https://pub-cc734373dc1544418e5ba00681e8514f.r2.dev/media/imagen2.jpg",
  "https://pub-cc734373dc1544418e5ba00681e8514f.r2.dev/media/banner3.jpg",
];

export function AboutMediaCarousel({ media, alt, autoPlayMs = 5000, className = "" }: AboutMediaCarouselProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasMedia = Boolean(media?.url);
  const slides: string[] = hasMedia && media!.url ? [media!.url] : PLACEHOLDER_IMAGES;

  useEffect(() => {
    if (slides.length < 2 || reduceMotion) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slides.length, autoPlayMs, reduceMotion]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {slides.map((src, index) => (
        <motion.div
          key={`${src}-${index}`}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: index === activeIndex ? 1 : 0 }}
          transition={{ duration: 0.8, ease: motionTokens.ease.standard }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
          />
        </motion.div>
      ))}

      {slides.length > 1 ? (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ir a slide ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-6 bg-white"
                  : "w-2.5 bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
