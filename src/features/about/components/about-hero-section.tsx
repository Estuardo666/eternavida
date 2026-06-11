"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { PublicLinkButton } from "@/components/ui/public-link-button";
import { motionTokens } from "@/motion/tokens";
import type { AboutHeroSection as AboutHeroSectionType } from "@/types/about-content";

interface AboutHeroSectionProps {
  content: AboutHeroSectionType;
}

const fadeUp = {
  initial: { opacity: 0, y: motionTokens.distance.lg },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.duration.page, ease: motionTokens.ease.standard },
  },
};

export function AboutHeroSection({ content }: AboutHeroSectionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-soft/40 via-white to-white">
      <div className="container py-16 sm:py-24 lg:py-32">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : "initial"}
            animate="animate"
            className="space-y-6"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex rounded-pill border border-border-brand bg-brand-soft px-3 py-1 text-caption uppercase tracking-[0.14em] text-text-brand"
            >
              {content.pretitle}
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="max-w-2xl text-display-sm text-text-primary sm:text-display-md lg:text-display-lg"
            >
              {content.title}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="max-w-xl text-body-lg text-text-secondary"
            >
              {content.subtitle}
            </motion.p>

            <motion.div variants={fadeUp}>
              <PublicLinkButton
                action={{ label: content.ctaText, href: content.ctaHref }}
                variant="primary"
              />
            </motion.div>
          </motion.div>

          {content.media?.url ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: motionTokens.duration.emphasis, ease: motionTokens.ease.soft }}
              className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border-soft shadow-lg"
            >
              <Image
                src={content.media.url}
                alt={content.media.altText}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
