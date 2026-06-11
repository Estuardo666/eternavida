"use client";

import { motion, useReducedMotion } from "framer-motion";

import { PublicLinkButton } from "@/components/ui/public-link-button";
import { AboutMediaCarousel } from "./about-media-carousel";
import { motionTokens } from "@/motion/tokens";
import type { AboutSectionBasic } from "@/types/about-content";

interface AboutProductionSectionProps {
  content: AboutSectionBasic;
}

export function AboutProductionSection({ content }: AboutProductionSectionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="w-full px-[clamp(24px,5vw,80px)] py-[clamp(60px,8vw,120px)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid items-start gap-8 lg:grid-cols-[0.67fr_1fr] lg:gap-16 xl:gap-20">
          <div className="relative order-2 lg:order-1 lg:sticky lg:top-28">
            <AboutMediaCarousel
              media={content.media}
              alt={content.title}
              className="aspect-[4/3] rounded-[28px] sm:aspect-[3/2] lg:aspect-[4/3]"
            />
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: motionTokens.ease.standard }}
            className="flex flex-col justify-center py-4 order-1 lg:order-2 lg:py-12"
          >
            <span className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-brand sm:text-xs">
              {content.pretitle}
            </span>

            <h2 className="mb-4 max-w-md text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-text-primary">
              {content.title}
            </h2>

            <p className="mb-6 max-w-sm text-[clamp(1rem,1.5vw,1.15rem)] leading-relaxed text-text-secondary">
              {content.subtitle}
            </p>

            <p className="mb-8 max-w-md text-[clamp(0.875rem,1.2vw,0.975rem)] leading-[1.7] text-text-secondary/85">
              {content.seoText}
            </p>

            <PublicLinkButton
              action={{ label: content.ctaText, href: content.ctaHref }}
              variant="primary"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
