"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { motionTokens } from "@/motion/tokens";
import type { AboutMissionSection, AboutVisionSection } from "@/types/about-content";

interface AboutMissionVisionSectionProps {
  mission: AboutMissionSection;
  vision: AboutVisionSection;
}

function MissionVisionCard({
  pretitle,
  title,
  text,
  media,
  index,
  reduceMotion,
}: {
  pretitle: string;
  title: string;
  text: string;
  media: { url: string; altText: string } | null;
  index: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: motionTokens.ease.standard, delay: index * 0.12 }}
      className="group relative h-[500px] overflow-hidden rounded-[28px] lg:h-[520px]"
    >
      {media?.url ? (
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.7, ease: motionTokens.ease.standard }}
        >
          <Image
            src={media.url}
            alt={media.altText}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-[#1a3a2a]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />

      <div className="relative flex h-full flex-col justify-end p-7 sm:p-9 lg:p-10">
        <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-xs">
          {pretitle}
        </span>
        <h3 className="mb-3 text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-white">
          {title}
        </h3>
        <p className="max-w-md text-[clamp(0.875rem,1.2vw,0.975rem)] leading-[1.65] text-white/80">
          {text}
        </p>
      </div>
    </motion.div>
  );
}

export function AboutMissionVisionSection({ mission, vision }: AboutMissionVisionSectionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="w-full px-[clamp(24px,5vw,80px)] py-[clamp(60px,8vw,120px)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <MissionVisionCard
            pretitle={mission.pretitle}
            title={mission.title}
            text={mission.seoText}
            media={mission.media ? { url: mission.media.url, altText: mission.media.altText } : null}
            index={0}
            reduceMotion={reduceMotion}
          />
          <MissionVisionCard
            pretitle={vision.pretitle}
            title={vision.title}
            text={vision.seoText}
            media={vision.media ? { url: vision.media.url, altText: vision.media.altText } : null}
            index={1}
            reduceMotion={reduceMotion}
          />
        </div>
      </div>
    </section>
  );
}
