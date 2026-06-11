import "server-only";

import type {
  AdminAboutContentEditorData,
  AdminAboutContentFormData,
  AdminAboutDiffItem,
  AdminAboutMediaAssetSummary,
} from "@/types/admin-about-content";
import type { AboutPageContent } from "@/types/about-content";
import { fallbackAboutPageContent } from "@/server/content/about-page-content.fallback";
import {
  findAboutPageContentRecord,
  listAboutMediaAssetRecords,
} from "@/server/content/admin-about-content.repository";

function mapMediaAssetSummary(record: {
  id: string;
  storageKey: string;
  publicUrl: string | null;
  kind: "image" | "video";
  altText: string | null;
}): AdminAboutMediaAssetSummary {
  return {
    id: record.id,
    storageKey: record.storageKey,
    publicUrl: record.publicUrl,
    kind: record.kind,
    altText: record.altText ?? "",
  };
}

interface DiffItemRaw {
  text: string;
  mediaId?: string | null;
}

function mapPublicContentToFormData(content: AboutPageContent): AdminAboutContentFormData {
  return {
    heroPretitle: content.hero.pretitle,
    heroTitle: content.hero.title,
    heroSubtitle: content.hero.subtitle,
    heroCtaText: content.hero.ctaText,
    heroCtaHref: content.hero.ctaHref,
    heroMediaId: content.hero.media?.id ?? "",

    historyPretitle: content.history.pretitle,
    historyTitle: content.history.title,
    historySubtitle: content.history.subtitle,
    historyCtaText: content.history.ctaText,
    historyCtaHref: content.history.ctaHref,
    historySeoText: content.history.seoText,
    historyMediaId: content.history.media?.id ?? "",

    missionPretitle: content.mission.pretitle,
    missionTitle: content.mission.title,
    missionSeoText: content.mission.seoText,
    missionMediaId: content.mission.media?.id ?? "",

    visionPretitle: content.vision.pretitle,
    visionTitle: content.vision.title,
    visionSubtitle: content.vision.subtitle,
    visionSeoText: content.vision.seoText,
    visionMediaId: content.vision.media?.id ?? "",

    diffPretitle: content.differentiators.pretitle,
    diffTitle: content.differentiators.title,
    diffSubtitle: content.differentiators.subtitle,
    diffCtaText: content.differentiators.ctaText,
    diffCtaHref: content.differentiators.ctaHref,
    diffSeoText: content.differentiators.seoText,
    diffItems: content.differentiators.items.map((item) => ({
      text: item.text,
      mediaId: item.mediaId ?? "",
    })),

    productionPretitle: content.production.pretitle,
    productionTitle: content.production.title,
    productionSubtitle: content.production.subtitle,
    productionCtaText: content.production.ctaText,
    productionCtaHref: content.production.ctaHref,
    productionSeoText: content.production.seoText,
    productionMediaId: content.production.media?.id ?? "",

    impactPretitle: content.impact.pretitle,
    impactTitle: content.impact.title,
    impactSubtitle: content.impact.subtitle,
    impactCtaText: content.impact.ctaText,
    impactCtaHref: content.impact.ctaHref,
    impactSeoText: content.impact.seoText,
    impactMediaId: content.impact.media?.id ?? "",

    ctaPretitle: content.cta.pretitle,
    ctaTitle: content.cta.title,
    ctaSubtitle: content.cta.subtitle,
    ctaCtaText: content.cta.ctaText,
    ctaCtaHref: content.cta.ctaHref,
  };
}

function mapStoredRecordToFormData(record: NonNullable<Awaited<ReturnType<typeof findAboutPageContentRecord>>>): AdminAboutContentFormData {
  const diffItemsRaw = record.diffItems as unknown as DiffItemRaw[];

  return {
    heroPretitle: record.heroPretitle,
    heroTitle: record.heroTitle,
    heroSubtitle: record.heroSubtitle,
    heroCtaText: record.heroCtaText,
    heroCtaHref: record.heroCtaHref,
    heroMediaId: record.heroMediaId ?? "",

    historyPretitle: record.historyPretitle,
    historyTitle: record.historyTitle,
    historySubtitle: record.historySubtitle,
    historyCtaText: record.historyCtaText,
    historyCtaHref: record.historyCtaHref,
    historySeoText: record.historySeoText,
    historyMediaId: record.historyMediaId ?? "",

    missionPretitle: record.missionPretitle,
    missionTitle: record.missionTitle,
    missionSeoText: record.missionSeoText,
    missionMediaId: record.missionMediaId ?? "",

    visionPretitle: record.visionPretitle,
    visionTitle: record.visionTitle,
    visionSubtitle: record.visionSubtitle,
    visionSeoText: record.visionSeoText,
    visionMediaId: record.visionMediaId ?? "",

    diffPretitle: record.diffPretitle,
    diffTitle: record.diffTitle,
    diffSubtitle: record.diffSubtitle,
    diffCtaText: record.diffCtaText,
    diffCtaHref: record.diffCtaHref,
    diffSeoText: record.diffSeoText,
    diffItems: diffItemsRaw.map((item): AdminAboutDiffItem => ({
      text: item.text,
      mediaId: item.mediaId ?? "",
    })),

    productionPretitle: record.productionPretitle,
    productionTitle: record.productionTitle,
    productionSubtitle: record.productionSubtitle,
    productionCtaText: record.productionCtaText,
    productionCtaHref: record.productionCtaHref,
    productionSeoText: record.productionSeoText,
    productionMediaId: record.productionMediaId ?? "",

    impactPretitle: record.impactPretitle,
    impactTitle: record.impactTitle,
    impactSubtitle: record.impactSubtitle,
    impactCtaText: record.impactCtaText,
    impactCtaHref: record.impactCtaHref,
    impactSeoText: record.impactSeoText,
    impactMediaId: record.impactMediaId ?? "",

    ctaPretitle: record.ctaPretitle,
    ctaTitle: record.ctaTitle,
    ctaSubtitle: record.ctaSubtitle,
    ctaCtaText: record.ctaCtaText,
    ctaCtaHref: record.ctaCtaHref,
  };
}

export async function getAboutContentEditorData(): Promise<AdminAboutContentEditorData> {
  const [aboutRecord, mediaAssetRecords] = await Promise.all([
    findAboutPageContentRecord(),
    listAboutMediaAssetRecords(),
  ]);

  return {
    content: aboutRecord
      ? mapStoredRecordToFormData(aboutRecord)
      : mapPublicContentToFormData(fallbackAboutPageContent),
    mediaAssets: mediaAssetRecords.map(mapMediaAssetSummary),
  };
}
