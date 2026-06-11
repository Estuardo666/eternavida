import "server-only";

import { prisma } from "@/server/db/prisma";

export async function findAboutPageContentRecord() {
  return prisma.aboutPageContent.findUnique({
    where: {
      slug: "acerca-de-nosotros",
    },
    include: {
      heroMedia: true,
      historyMedia: true,
      missionMedia: true,
      visionMedia: true,
      productionMedia: true,
      impactMedia: true,
    },
  });
}

export async function listAboutMediaAssetRecords() {
  return prisma.mediaAsset.findMany({
    where: {
      kind: "image",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      storageKey: true,
      publicUrl: true,
      kind: true,
      altText: true,
    },
  });
}
