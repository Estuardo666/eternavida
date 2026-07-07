import "server-only";

import { prisma } from "@/server/db/prisma";

export async function assertMediaAssetExists(mediaAssetId: string | null): Promise<void> {
  if (!mediaAssetId) return;

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: mediaAssetId },
    select: { id: true },
  });

  if (!asset) {
    throw new Error("The selected media asset does not exist.");
  }
}
