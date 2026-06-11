"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { PublicLinkButton } from "@/components/ui/public-link-button";
import { motionTokens } from "@/motion/tokens";
import type { AboutSectionBasic } from "@/types/about-content";

interface AboutImpactSectionProps {
  content: AboutSectionBasic;
}

export function AboutImpactSection({ content }: AboutImpactSectionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="bg-gradient-to-b from-white via-brand-soft/15 to-white py-16 sm:py-24">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -motionTokens.distance.lg }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: motionTokens.duration.page, ease: motionTokens.ease.standard }}
            className="space-y-6"
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

          {content.media?.url ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: motionTokens.distance.lg }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: motionTokens.duration.page, ease: motionTokens.ease.standard }}
              className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border-soft shadow-lg"
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
        </div>
      </div>
    </section>
  );
}
