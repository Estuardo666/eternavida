"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { fadeScaleIn } from "./about-motion";
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
    <div className="group relative h-[500px] overflow-hidden lg:h-[560px]">
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

      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/70 to-black/25" />

      <motion.div
        {...fadeScaleIn(reduceMotion, index * 0.12)}
        className="relative flex h-full flex-col justify-start p-7 sm:p-9 lg:p-10"
      >
        <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-xs">
          {pretitle}
        </span>
        <h3 className="mb-3 min-h-[calc(2*1.12em)] text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-white">
          {title}
        </h3>
        <p className="max-w-md whitespace-pre-line text-justify hyphens-auto text-[clamp(0.875rem,1.2vw,0.975rem)] leading-[1.65] text-white/80">
          {text}
        </p>
      </motion.div>
    </div>
  );
}

export function AboutMissionVisionSection({ mission, vision }: AboutMissionVisionSectionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="w-full pb-0 pt-[clamp(60px,8vw,120px)]">
      <div className="w-full">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
          <MissionVisionCard
            pretitle={mission.pretitle}
            title={mission.title}
            text={mission.seoText}
            media={mission.media?.url ? { url: mission.media.url, altText: mission.media.altText } : null}
            index={0}
            reduceMotion={reduceMotion}
          />
          <MissionVisionCard
            pretitle={vision.pretitle}
            title={vision.title}
            text={vision.seoText}
            media={vision.media?.url ? { url: vision.media.url, altText: vision.media.altText } : null}
            index={1}
            reduceMotion={reduceMotion}
          />
        </div>
      </div>
    </section>
  );
}
