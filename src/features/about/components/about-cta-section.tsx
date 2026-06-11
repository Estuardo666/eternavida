"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { PublicLinkButton } from "@/components/ui/public-link-button";
import { motionTokens } from "@/motion/tokens";
import type { AboutCtaSection as AboutCtaSectionType } from "@/types/about-content";

interface AboutCtaSectionProps {
  content: AboutCtaSectionType;
}

export function AboutCtaSection({ content }: AboutCtaSectionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="w-full px-[clamp(24px,5vw,80px)] py-[clamp(60px,8vw,120px)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid min-h-[500px] overflow-hidden rounded-[28px] lg:grid-cols-2">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: motionTokens.ease.standard }}
            className="flex flex-col justify-center bg-[#14352A] p-8 sm:p-12 lg:p-16"
          >
            <span className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400/70 sm:text-xs">
              {content.pretitle}
            </span>

            <h2 className="mb-4 max-w-md text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
              {content.title}
            </h2>

            <p className="mb-8 max-w-sm text-[clamp(1rem,1.5vw,1.15rem)] leading-relaxed text-white/70">
              {content.subtitle}
            </p>

            <PublicLinkButton
              action={{ label: content.ctaText, href: content.ctaHref }}
              variant="primary"
            />
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: motionTokens.ease.standard }}
            className="relative min-h-[300px] lg:min-h-0"
          >
            <Image
              src="https://pub-cc734373dc1544418e5ba00681e8514f.r2.dev/media/about-cta.webp"
              alt="Productos naturales Eterna Vida"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
