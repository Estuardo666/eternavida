"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { motionTokens } from "@/motion/tokens";
import type { AboutMissionSection, AboutVisionSection } from "@/types/about-content";

interface AboutMissionVisionSectionProps {
  mission: AboutMissionSection;
  vision: AboutVisionSection;
}

const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -4,
    scale: 1.01,
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.soft },
  },
};

function MissionVisionCard({
  pretitle,
  title,
  seoText,
  subtitle,
  media,
  index,
  reduceMotion,
}: {
  pretitle: string;
  title: string;
  seoText: string;
  subtitle?: string;
  media: { url: string; altText: string } | null;
  index: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: motionTokens.distance.lg }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: motionTokens.duration.page,
        ease: motionTokens.ease.standard,
        delay: index * 0.1,
      }}
      variants={cardHover}
      whileHover="hover"
      className="group flex flex-col overflow-hidden rounded-3xl border border-border-soft bg-surface-canvas shadow-sm transition-shadow hover:shadow-md"
    >
      {media?.url ? (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={media.url}
            alt={media.altText}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col space-y-4 p-6 sm:p-8">
        <span className="inline-flex w-fit rounded-pill border border-border-brand bg-brand-soft px-3 py-1 text-caption uppercase tracking-[0.14em] text-text-brand">
          {pretitle}
        </span>

        <h3 className="text-headline-sm text-text-primary">{title}</h3>

        {subtitle ? (
          <p className="text-body-lg text-text-secondary">{subtitle}</p>
        ) : null}

        <p className="text-body-md text-text-secondary">{seoText}</p>
      </div>
    </motion.div>
  );
}

export function AboutMissionVisionSection({ mission, vision }: AboutMissionVisionSectionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="container py-16 sm:py-24">
      <div className="grid gap-8 lg:grid-cols-2">
        <MissionVisionCard
          pretitle={mission.pretitle}
          title={mission.title}
          seoText={mission.seoText}
          media={mission.media ? { url: mission.media.url, altText: mission.media.altText } : null}
          index={0}
          reduceMotion={reduceMotion}
        />
        <MissionVisionCard
          pretitle={vision.pretitle}
          title={vision.title}
          subtitle={vision.subtitle}
          seoText={vision.seoText}
          media={vision.media ? { url: vision.media.url, altText: vision.media.altText } : null}
          index={1}
          reduceMotion={reduceMotion}
        />
      </div>
    </section>
  );
}
