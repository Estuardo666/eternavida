import type { MediaAsset } from "@/types/media";

export interface AboutDiffItem {
  id: string;
  text: string;
  mediaId: string | null;
  media: MediaAsset | null;
}

export interface AboutSectionBasic {
  pretitle: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  seoText: string;
  media: MediaAsset | null;
}

export interface AboutHeroSection {
  pretitle: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  media: MediaAsset | null;
}

export interface AboutHistorySection {
  pretitle: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  seoText: string;
  media: MediaAsset | null;
}

export interface AboutMissionSection {
  pretitle: string;
  title: string;
  seoText: string;
  media: MediaAsset | null;
}

export interface AboutVisionSection {
  pretitle: string;
  title: string;
  subtitle: string;
  seoText: string;
  media: MediaAsset | null;
}

export interface AboutDiffSection {
  pretitle: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  seoText: string;
  items: AboutDiffItem[];
}

export interface AboutCtaSection {
  pretitle: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

export interface AboutPageContent {
  hero: AboutHeroSection;
  history: AboutHistorySection;
  mission: AboutMissionSection;
  vision: AboutVisionSection;
  differentiators: AboutDiffSection;
  production: AboutSectionBasic;
  impact: AboutSectionBasic;
  cta: AboutCtaSection;
}

export interface AboutPageContentResult {
  content: AboutPageContent;
  source: "fallback" | "database";
}
