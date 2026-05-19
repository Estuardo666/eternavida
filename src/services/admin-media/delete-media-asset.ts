import "server-only";

import { deleteObjectFromCloudflareR2 } from "@/server/storage/cloudflare-r2";
import { deleteMediaAsset, getMediaAssetById } from "@/server/media/admin-media-library.repository";
import { MediaLibraryNotFoundError } from "./admin-media.errors";

export async function deleteAsset(id: string) {
  const existing = await getMediaAssetById(id);
  if (!existing) {
    throw new MediaLibraryNotFoundError("Media asset not found.");
  }

  // R2 delete first — idempotent, safe to retry if DB step fails
  await deleteObjectFromCloudflareR2(existing.storageKey);

  await deleteMediaAsset(id);
  return { deletedId: id };
}
