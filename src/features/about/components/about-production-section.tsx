"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { PublicLinkButton } from "@/components/ui/public-link-button";
import { motionTokens } from "@/motion/tokens";
import type { AboutSectionBasic } from "@/types/about-content";

interface AboutProductionSectionProps {
  content: AboutSectionBasic;
}

export function AboutProductionSection({ content }: AboutProductionSectionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section id="produccion" className="container py-16 sm:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {content.media?.url ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: motionTokens.duration.page, ease: motionTokens.ease.standard }}
            className="relative aspect-square overflow-hidden rounded-3xl border border-border-soft shadow-lg order-2 lg:order-1"
          >
            <Image
              src={content.media.url}
              alt={content.media.altText}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        ) : null}

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: motionTokens.distance.lg }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: motionTokens.duration.page, ease: motionTokens.ease.standard }}
          className="space-y-6 order-1 lg:order-2"
        >
          <span className="inline-flex rounded-pill border border-border-brand bg-brand-soft px-3 py-1 text-caption uppercase tracking-[0.14em] text-text-brand">
            {content.pretitle}
          </span>

          <h2 className="max-w-2xl text-headline-sm text-text-primary sm:text-headline-md">
            {content.title}
          </h2>

          <p className="max-w-prose text-body-lg text-text-secondary">
            {content.subtitle}
          </p>

          <p className="max-w-prose text-body-md text-text-secondary">
            {content.seoText}
          </p>

          <PublicLinkButton
            action={{ label: content.ctaText, href: content.ctaHref }}
            variant="primary"
          />
        </motion.div>
      </div>
    </section>
  );
}
