import "server-only";

import { findAboutPageContentRecord } from "@/server/content/admin-about-content.repository";
import type { AboutPageContent, AboutDiffItem } from "@/types/about-content";
import type { MediaAsset } from "@/types/media";

function buildLocalMediaAsset(fileName: string, altText: string): MediaAsset {
  return {
    id: `about-media-${fileName}`,
    kind: "image",
    url: `/media/new dev media/${encodeURIComponent(fileName)}`,
    storageKey: `public/media/new dev media/${fileName}`,
    altText,
    mimeType: null,
    posterUrl: null,
    width: null,
    height: null,
    durationSeconds: null,
  };
}

const DIFF_ITEM_IMAGE_FILES = [
  "138219.jpg",
  "147186.jpg",
  "2247.jpg",
  "87122.jpg",
  "364942.jpg",
  "23273.jpg",
] as const;

interface DiffItemRaw {
  text: string;
  mediaId?: string | null;
}

export async function readStoredAboutPageContent(): Promise<AboutPageContent | null> {
  const record = await findAboutPageContentRecord();

  if (!record) return null;

  const diffItemsRaw = record.diffItems as unknown as DiffItemRaw[];

  const diffItems: AboutDiffItem[] = diffItemsRaw.map((item, index) => ({
    id: `diff-${index + 1}`,
    text: item.text,
    mediaId: item.mediaId ?? null,
    media: buildLocalMediaAsset(DIFF_ITEM_IMAGE_FILES[index % DIFF_ITEM_IMAGE_FILES.length] ?? DIFF_ITEM_IMAGE_FILES[0], item.text),
  }));

  return {
    hero: {
      pretitle: record.heroPretitle,
      title: record.heroTitle,
      subtitle: record.heroSubtitle,
      ctaText: record.heroCtaText,
      ctaHref: record.heroCtaHref,
      media: buildLocalMediaAsset("364942.jpg", record.heroTitle),
    },
    history: {
      pretitle: record.historyPretitle,
      title: record.historyTitle,
      subtitle: record.historySubtitle,
      ctaText: record.historyCtaText,
      ctaHref: record.historyCtaHref,
      seoText: record.historySeoText,
      media: buildLocalMediaAsset("23273.jpg", record.historyTitle),
    },
    mission: {
      pretitle: record.missionPretitle,
      title: record.missionTitle,
      seoText: record.missionSeoText,
      media: buildLocalMediaAsset("484899.jpg", record.missionTitle),
    },
    vision: {
      pretitle: record.visionPretitle,
      title: record.visionTitle,
      subtitle: record.visionSubtitle,
      seoText: record.visionSeoText,
      media: buildLocalMediaAsset("48159.jpg", record.visionTitle),
    },
    differentiators: {
      pretitle: record.diffPretitle,
      title: record.diffTitle,
      subtitle: record.diffSubtitle,
      ctaText: record.diffCtaText,
      ctaHref: record.diffCtaHref,
      seoText: record.diffSeoText,
      items: diffItems,
    },
    production: {
      pretitle: record.productionPretitle,
      title: record.productionTitle,
      subtitle: record.productionSubtitle,
      ctaText: record.productionCtaText,
      ctaHref: record.productionCtaHref,
      seoText: record.productionSeoText,
      media: buildLocalMediaAsset("181090.jpg", record.productionTitle),
    },
    impact: {
      pretitle: record.impactPretitle,
      title: record.impactTitle,
      subtitle: record.impactSubtitle,
      ctaText: record.impactCtaText,
      ctaHref: record.impactCtaHref,
      seoText: record.impactSeoText,
      media: buildLocalMediaAsset("1107.jpg", record.impactTitle),
    },
    cta: {
      pretitle: record.ctaPretitle,
      title: record.ctaTitle,
      subtitle: record.ctaSubtitle,
      ctaText: record.ctaCtaText,
      ctaHref: record.ctaCtaHref,
    },
  };
}
