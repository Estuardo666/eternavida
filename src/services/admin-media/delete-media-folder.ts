import "server-only";

import { deleteMediaFolder, getMediaFolderById } from "@/server/media/admin-media-library.repository";
import { MediaLibraryNotFoundError } from "./admin-media.errors";

export async function deleteFolder(id: string) {
  const existing = await getMediaFolderById(id);
  if (!existing) {
    throw new MediaLibraryNotFoundError("Folder not found.");
  }

  await deleteMediaFolder(id);
  return { deletedId: id };
}
