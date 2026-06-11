"use client";

import { motion, useReducedMotion } from "framer-motion";

import { PublicLinkButton } from "@/components/ui/public-link-button";
import { motionTokens } from "@/motion/tokens";
import type { AboutCtaSection as AboutCtaSectionType } from "@/types/about-content";

interface AboutCtaSectionProps {
  content: AboutCtaSectionType;
}

export function AboutCtaSection({ content }: AboutCtaSectionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="container py-16 sm:py-24">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: motionTokens.distance.lg }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: motionTokens.duration.page, ease: motionTokens.ease.standard }}
        className="relative overflow-hidden rounded-[32px] border border-border-brand bg-gradient-to-br from-brand-soft via-surface-canvas to-brand-accent/10 p-8 text-center shadow-sm sm:p-12 lg:p-16"
      >
        <div className="relative z-10 mx-auto max-w-2xl space-y-6">
          <span className="inline-flex rounded-pill border border-border-brand bg-brand-soft px-3 py-1 text-caption uppercase tracking-[0.14em] text-text-brand">
            {content.pretitle}
          </span>

          <h2 className="text-headline-md text-text-primary sm:text-display-sm">
            {content.title}
          </h2>

          <p className="text-body-lg text-text-secondary">
            {content.subtitle}
          </p>

          <div className="flex justify-center pt-2">
            <PublicLinkButton
              action={{ label: content.ctaText, href: content.ctaHref }}
              variant="primary"
            />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-primary/5 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-accent/10 blur-3xl"
        />
      </motion.div>
    </section>
  );
}
