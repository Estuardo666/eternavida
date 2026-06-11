import { AboutCtaSection } from "./about-cta-section";
import { AboutDifferentiatorsSection } from "./about-differentiators-section";
import { AboutHeroSection } from "./about-hero-section";
import { AboutHistorySection } from "./about-history-section";
import { AboutImpactSection } from "./about-impact-section";
import { AboutMissionVisionSection } from "./about-mission-vision-section";
import { AboutProductionSection } from "./about-production-section";
import type { AboutPageContentResult } from "@/types/about-content";

interface AboutPageViewProps {
  contentResult: AboutPageContentResult;
}

export function AboutPageView({ contentResult }: AboutPageViewProps) {
  const { content } = contentResult;

  return (
    <>
      <AboutHeroSection content={content.hero} />
      <AboutHistorySection content={content.history} />
      <AboutMissionVisionSection mission={content.mission} vision={content.vision} />
      <AboutDifferentiatorsSection content={content.differentiators} />
      <AboutProductionSection content={content.production} />
      <AboutImpactSection content={content.impact} />
      <AboutCtaSection content={content.cta} />
    </>
  );
}
