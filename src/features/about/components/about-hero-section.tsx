"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { PublicLinkButton } from "@/components/ui/public-link-button";
import { motionTokens } from "@/motion/tokens";
import type { AboutHeroSection as AboutHeroSectionType } from "@/types/about-content";

interface AboutHeroSectionProps {
  content: AboutHeroSectionType;
}

export function AboutHeroSection({ content }: AboutHeroSectionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
      {content.media?.url ? (
        <Image
          src={content.media.url}
          alt={content.media.altText}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-[#1a3a2a]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="relative flex h-full items-end pb-[15vh] sm:pb-[18vh] lg:pb-[20vh]">
        <div className="w-full px-[clamp(24px,5vw,80px)]">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-col items-center text-center">
              <motion.span
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: motionTokens.ease.standard, delay: 0.2 }}
                className="mb-4 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm sm:text-xs"
              >
                {content.pretitle}
              </motion.span>

              <motion.h1
                initial={reduceMotion ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: motionTokens.ease.standard, delay: 0.35 }}
                className="mb-5 max-w-3xl text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-[clamp(2.5rem,5vw,4.5rem)]"
              >
                {content.title}
              </motion.h1>

              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: motionTokens.ease.standard, delay: 0.5 }}
                className="mb-8 max-w-xl text-[clamp(0.95rem,1.8vw,1.15rem)] leading-relaxed text-white/80 sm:text-lg"
              >
                {content.subtitle}
              </motion.p>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: motionTokens.ease.standard, delay: 0.65 }}
              >
                <PublicLinkButton
                  action={{ label: content.ctaText, href: content.ctaHref }}
                  variant="primary"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
