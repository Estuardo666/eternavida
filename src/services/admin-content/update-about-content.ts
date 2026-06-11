import "server-only";

import { adminAboutContentFormSchema } from "@/features/admin-content/schemas/admin-about-content.schema";
import { prisma } from "@/server/db/prisma";
import type { AdminAboutContentFormData } from "@/types/admin-about-content";

export async function updateAboutContent(input: AdminAboutContentFormData) {
  const parsedInput = adminAboutContentFormSchema.parse(input);

  const mediaIds = [
    parsedInput.heroMediaId,
    parsedInput.historyMediaId,
    parsedInput.missionMediaId,
    parsedInput.visionMediaId,
    parsedInput.productionMediaId,
    parsedInput.impactMediaId,
    ...parsedInput.diffItems.map((item) => item.mediaId),
  ].filter((value): value is string => value.length > 0);

  if (mediaIds.length > 0) {
    const existingMediaAssets = await prisma.mediaAsset.findMany({
      where: { id: { in: mediaIds } },
      select: { id: true },
    });

    if (existingMediaAssets.length !== new Set(mediaIds).size) {
      throw new Error("One or more selected media assets do not exist.");
    }
  }

  const diffItemsJson = parsedInput.diffItems.map((item) => ({
    text: item.text,
    mediaId: item.mediaId || null,
  }));

  return prisma.aboutPageContent.upsert({
    where: {
      slug: "acerca-de-nosotros",
    },
    update: {
      heroPretitle: parsedInput.heroPretitle,
      heroTitle: parsedInput.heroTitle,
      heroSubtitle: parsedInput.heroSubtitle,
      heroCtaText: parsedInput.heroCtaText,
      heroCtaHref: parsedInput.heroCtaHref,
      heroMediaId: parsedInput.heroMediaId || null,

      historyPretitle: parsedInput.historyPretitle,
      historyTitle: parsedInput.historyTitle,
      historySubtitle: parsedInput.historySubtitle,
      historyCtaText: parsedInput.historyCtaText,
      historyCtaHref: parsedInput.historyCtaHref,
      historySeoText: parsedInput.historySeoText,
      historyMediaId: parsedInput.historyMediaId || null,

      missionPretitle: parsedInput.missionPretitle,
      missionTitle: parsedInput.missionTitle,
      missionSeoText: parsedInput.missionSeoText,
      missionMediaId: parsedInput.missionMediaId || null,

      visionPretitle: parsedInput.visionPretitle,
      visionTitle: parsedInput.visionTitle,
      visionSubtitle: parsedInput.visionSubtitle,
      visionSeoText: parsedInput.visionSeoText,
      visionMediaId: parsedInput.visionMediaId || null,

      diffPretitle: parsedInput.diffPretitle,
      diffTitle: parsedInput.diffTitle,
      diffSubtitle: parsedInput.diffSubtitle,
      diffCtaText: parsedInput.diffCtaText,
      diffCtaHref: parsedInput.diffCtaHref,
      diffSeoText: parsedInput.diffSeoText,
      diffItems: diffItemsJson,

      productionPretitle: parsedInput.productionPretitle,
      productionTitle: parsedInput.productionTitle,
      productionSubtitle: parsedInput.productionSubtitle,
      productionCtaText: parsedInput.productionCtaText,
      productionCtaHref: parsedInput.productionCtaHref,
      productionSeoText: parsedInput.productionSeoText,
      productionMediaId: parsedInput.productionMediaId || null,

      impactPretitle: parsedInput.impactPretitle,
      impactTitle: parsedInput.impactTitle,
      impactSubtitle: parsedInput.impactSubtitle,
      impactCtaText: parsedInput.impactCtaText,
      impactCtaHref: parsedInput.impactCtaHref,
      impactSeoText: parsedInput.impactSeoText,
      impactMediaId: parsedInput.impactMediaId || null,

      ctaPretitle: parsedInput.ctaPretitle,
      ctaTitle: parsedInput.ctaTitle,
      ctaSubtitle: parsedInput.ctaSubtitle,
      ctaCtaText: parsedInput.ctaCtaText,
      ctaCtaHref: parsedInput.ctaCtaHref,
    },
    create: {
      slug: "acerca-de-nosotros",
      heroPretitle: parsedInput.heroPretitle,
      heroTitle: parsedInput.heroTitle,
      heroSubtitle: parsedInput.heroSubtitle,
      heroCtaText: parsedInput.heroCtaText,
      heroCtaHref: parsedInput.heroCtaHref,
      heroMediaId: parsedInput.heroMediaId || null,

      historyPretitle: parsedInput.historyPretitle,
      historyTitle: parsedInput.historyTitle,
      historySubtitle: parsedInput.historySubtitle,
      historyCtaText: parsedInput.historyCtaText,
      historyCtaHref: parsedInput.historyCtaHref,
      historySeoText: parsedInput.historySeoText,
      historyMediaId: parsedInput.historyMediaId || null,

      missionPretitle: parsedInput.missionPretitle,
      missionTitle: parsedInput.missionTitle,
      missionSeoText: parsedInput.missionSeoText,
      missionMediaId: parsedInput.missionMediaId || null,

      visionPretitle: parsedInput.visionPretitle,
      visionTitle: parsedInput.visionTitle,
      visionSubtitle: parsedInput.visionSubtitle,
      visionSeoText: parsedInput.visionSeoText,
      visionMediaId: parsedInput.visionMediaId || null,

      diffPretitle: parsedInput.diffPretitle,
      diffTitle: parsedInput.diffTitle,
      diffSubtitle: parsedInput.diffSubtitle,
      diffCtaText: parsedInput.diffCtaText,
      diffCtaHref: parsedInput.diffCtaHref,
      diffSeoText: parsedInput.diffSeoText,
      diffItems: diffItemsJson,

      productionPretitle: parsedInput.productionPretitle,
      productionTitle: parsedInput.productionTitle,
      productionSubtitle: parsedInput.productionSubtitle,
      productionCtaText: parsedInput.productionCtaText,
      productionCtaHref: parsedInput.productionCtaHref,
      productionSeoText: parsedInput.productionSeoText,
      productionMediaId: parsedInput.productionMediaId || null,

      impactPretitle: parsedInput.impactPretitle,
      impactTitle: parsedInput.impactTitle,
      impactSubtitle: parsedInput.impactSubtitle,
      impactCtaText: parsedInput.impactCtaText,
      impactCtaHref: parsedInput.impactCtaHref,
      impactSeoText: parsedInput.impactSeoText,
      impactMediaId: parsedInput.impactMediaId || null,

      ctaPretitle: parsedInput.ctaPretitle,
      ctaTitle: parsedInput.ctaTitle,
      ctaSubtitle: parsedInput.ctaSubtitle,
      ctaCtaText: parsedInput.ctaCtaText,
      ctaCtaHref: parsedInput.ctaCtaHref,
    },
    select: { id: true },
  });
}
