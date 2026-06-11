import "server-only";

import { findAboutPageContentRecord } from "@/server/content/admin-about-content.repository";
import type { AboutPageContent, AboutDiffItem } from "@/types/about-content";
import type { MediaAsset } from "@/types/media";

function mapMediaAsset(record: {
  id: string;
  storageKey: string;
  publicUrl: string | null;
  kind: "image" | "video";
  altText: string | null;
  mimeType: string | null;
  posterUrl: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
} | null): MediaAsset | null {
  if (!record) return null;

  return {
    id: record.id,
    kind: record.kind,
    url: record.publicUrl ?? `/api/media/${encodeURIComponent(record.storageKey)}`,
    storageKey: record.storageKey,
    altText: record.altText ?? "",
    mimeType: record.mimeType,
    posterUrl: record.posterUrl,
    width: record.width,
    height: record.height,
    durationSeconds: record.durationSeconds,
  };
}

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
    media: null,
  }));

  return {
    hero: {
      pretitle: record.heroPretitle,
      title: record.heroTitle,
      subtitle: record.heroSubtitle,
      ctaText: record.heroCtaText,
      ctaHref: record.heroCtaHref,
      media: mapMediaAsset(record.heroMedia),
    },
    history: {
      pretitle: record.historyPretitle,
      title: record.historyTitle,
      subtitle: record.historySubtitle,
      ctaText: record.historyCtaText,
      ctaHref: record.historyCtaHref,
      seoText: record.historySeoText,
      media: mapMediaAsset(record.historyMedia),
    },
    mission: {
      pretitle: record.missionPretitle,
      title: record.missionTitle,
      seoText: record.missionSeoText,
      media: mapMediaAsset(record.missionMedia),
    },
    vision: {
      pretitle: record.visionPretitle,
      title: record.visionTitle,
      subtitle: record.visionSubtitle,
      seoText: record.visionSeoText,
      media: mapMediaAsset(record.visionMedia),
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
      media: mapMediaAsset(record.productionMedia),
    },
    impact: {
      pretitle: record.impactPretitle,
      title: record.impactTitle,
      subtitle: record.impactSubtitle,
      ctaText: record.impactCtaText,
      ctaHref: record.impactCtaHref,
      seoText: record.impactSeoText,
      media: mapMediaAsset(record.impactMedia),
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
