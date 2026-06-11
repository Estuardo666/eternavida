"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { PublicLinkButton } from "@/components/ui/public-link-button";
import { motionTokens } from "@/motion/tokens";
import type { AboutDiffSection } from "@/types/about-content";

interface AboutDifferentiatorsSectionProps {
  content: AboutDiffSection;
}

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: motionTokens.distance.md },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.duration.base, ease: motionTokens.ease.standard },
  },
};

export function AboutDifferentiatorsSection({ content }: AboutDifferentiatorsSectionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="bg-gradient-to-b from-white via-brand-soft/20 to-white py-16 sm:py-24">
      <div className="container">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: motionTokens.distance.md }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: motionTokens.duration.page, ease: motionTokens.ease.standard }}
          className="mb-12 space-y-4 text-center"
        >
          <span className="inline-flex rounded-pill border border-border-brand bg-brand-soft px-3 py-1 text-caption uppercase tracking-[0.14em] text-text-brand">
            {content.pretitle}
          </span>

          <h2 className="mx-auto max-w-2xl text-headline-sm text-text-primary sm:text-headline-md">
            {content.title}
          </h2>

          <p className="mx-auto max-w-xl text-body-lg text-text-secondary">
            {content.subtitle}
          </p>

          <p className="mx-auto max-w-2xl text-body-md text-text-secondary">
            {content.seoText}
          </p>
        </motion.div>

        <motion.div
          variants={reduceMotion ? undefined : containerVariants}
          initial={reduceMotion ? false : "initial"}
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {content.items.map((item) => (
            <motion.article
              key={item.id}
              variants={reduceMotion ? undefined : itemVariants}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface-canvas shadow-sm transition-shadow hover:shadow-md"
            >
              {item.media?.url ? (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={item.media.url}
                    alt={item.media.altText}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              ) : null}

              <div className="flex flex-1 items-center p-5">
                <p className="text-section-sm text-text-primary">{item.text}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: motionTokens.distance.sm }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.standard }}
          className="mt-10 text-center"
        >
          <PublicLinkButton
            action={{ label: content.ctaText, href: content.ctaHref }}
            variant="primary"
          />
        </motion.div>
      </div>
    </section>
  );
}
