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
    <main className="bg-white [&_h2]:tracking-[-0.03em]">
      <AboutHeroSection content={content.hero} />
      <AboutHistorySection content={content.history} />
      <AboutMissionVisionSection mission={content.mission} vision={content.vision} />
      <AboutDifferentiatorsSection content={content.differentiators} />
      <AboutImpactSection content={content.impact} />
      <AboutProductionSection content={content.production} />
      <AboutCtaSection content={content.cta} />
    </main>
  );
}
