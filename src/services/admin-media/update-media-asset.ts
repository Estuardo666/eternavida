import "server-only";

import { updateMediaAssetSchema, type UpdateMediaAssetInput } from "@/features/admin-media/schemas/media-library.schema";
import { getMediaAssetById, getMediaFolderById, updateMediaAsset } from "@/server/media/admin-media-library.repository";
import { MediaLibraryNotFoundError } from "./admin-media.errors";

export async function updateAsset(id: string, input: UpdateMediaAssetInput) {
  const parsed = updateMediaAssetSchema.parse(input);

  const existing = await getMediaAssetById(id);
  if (!existing) {
    throw new MediaLibraryNotFoundError("Media asset not found.");
  }

  if (parsed.folderId) {
    const folder = await getMediaFolderById(parsed.folderId);
    if (!folder) {
      throw new MediaLibraryNotFoundError("Target folder not found.");
    }
  }

  return updateMediaAsset(id, parsed);
}
