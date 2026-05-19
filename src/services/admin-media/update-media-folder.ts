import "server-only";

import { updateFolderSchema, type UpdateFolderInput } from "@/features/admin-media/schemas/media-library.schema";
import { getMediaFolderById, updateMediaFolder } from "@/server/media/admin-media-library.repository";
import { MediaLibraryConflictError, MediaLibraryNotFoundError } from "./admin-media.errors";

export async function updateFolder(id: string, input: UpdateFolderInput) {
  const parsed = updateFolderSchema.parse(input);

  const existing = await getMediaFolderById(id);
  if (!existing) {
    throw new MediaLibraryNotFoundError("Folder not found.");
  }

  if (parsed.parentId === id) {
    throw new MediaLibraryConflictError("A folder cannot be its own parent.");
  }

  if (parsed.parentId) {
    const newParent = await getMediaFolderById(parsed.parentId);
    if (!newParent) {
      throw new MediaLibraryNotFoundError("Parent folder not found.");
    }
  }

  return updateMediaFolder(id, parsed);
}
