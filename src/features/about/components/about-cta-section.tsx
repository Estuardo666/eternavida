"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { PublicLinkButton } from "@/components/ui/public-link-button";
import { fadeScaleIn } from "./about-motion";
import type { AboutCtaSection as AboutCtaSectionType } from "@/types/about-content";

interface AboutCtaSectionProps {
  content: AboutCtaSectionType;
}

export function AboutCtaSection({ content }: AboutCtaSectionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="w-full">
      <div className="w-full">
        <div className="grid min-h-[500px] w-full overflow-hidden lg:grid-cols-2">
          <motion.div
            {...fadeScaleIn(reduceMotion)}
            className="flex flex-col justify-center bg-[#14352A] p-8 sm:p-12 lg:p-16"
          >
            <span className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400/70 sm:text-xs">
              {content.pretitle}
            </span>

            <h2 className="mb-4 max-w-md text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-brand-goldLight">
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

          <div className="relative min-h-[300px] lg:min-h-0">
            <Image
              src="/media/new dev media/181090.jpg"
              alt="Productos naturales Eterna Vida"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
