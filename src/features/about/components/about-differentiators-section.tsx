"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { motionTokens } from "@/motion/tokens";
import type { AboutDiffSection, AboutDiffItem } from "@/types/about-content";

interface AboutDifferentiatorsSectionProps {
  content: AboutDiffSection;
}

function DiffCard({
  item,
  index,
  reduceMotion,
}: {
  item: AboutDiffItem;
  index: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: motionTokens.ease.standard, delay: index * 0.1 }}
      className="group grid min-h-[320px] grid-cols-[0.35fr_0.65fr] overflow-hidden rounded-[24px] bg-white/[0.04] backdrop-blur-sm sm:grid-cols-[320px_1fr]"
    >
      <div className="relative overflow-hidden">
        {item.media?.url ? (
          <Image
            src={item.media.url}
            alt={item.media.altText}
            fill
            sizes="320px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-white/[0.06]" />
        )}
      </div>

      <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-10">
        <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.07]">
          <span className="text-sm font-semibold text-white/80">{String(index + 1).padStart(2, "0")}</span>
        </span>

        <h3 className="mb-3 text-[clamp(1.25rem,2.5vw,1.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-white">
          {item.text}
        </h3>

        <p className="max-w-sm text-[clamp(0.875rem,1.1vw,0.95rem)] leading-[1.7] text-white/65">
          Ingredientes cuidadosamente seleccionados y procesos responsables que garantizan la máxima calidad en cada producto.
        </p>
      </div>
    </motion.article>
  );
}

export function AboutDifferentiatorsSection({ content }: AboutDifferentiatorsSectionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="w-full bg-[#14352A] px-[clamp(24px,5vw,80px)] py-[clamp(60px,8vw,120px)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid items-start gap-12 lg:grid-cols-[0.3fr_0.7fr] lg:gap-16 xl:gap-20">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: motionTokens.ease.standard }}
            className="lg:sticky lg:top-28"
          >
            <span className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400/70 sm:text-xs">
              {content.pretitle}
            </span>

            <h2 className="mb-4 max-w-sm text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-white">
              {content.title}
            </h2>

            <p className="mb-6 max-w-sm text-[clamp(1rem,1.5vw,1.15rem)] leading-relaxed text-white/70">
              {content.subtitle}
            </p>

            <p className="max-w-sm text-[clamp(0.875rem,1.2vw,0.975rem)] leading-[1.7] text-white/55">
              {content.seoText}
            </p>
          </motion.div>

          <div className="flex flex-col gap-6">
            {content.items.map((item, index) => (
              <DiffCard
                key={item.id}
                item={item}
                index={index}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
