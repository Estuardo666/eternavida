import "server-only";

import { createFolderSchema, type CreateFolderInput } from "@/features/admin-media/schemas/media-library.schema";
import { createMediaFolder, getMediaFolderById } from "@/server/media/admin-media-library.repository";
import { MediaLibraryNotFoundError } from "./admin-media.errors";

export async function createFolder(input: CreateFolderInput) {
  const parsed = createFolderSchema.parse(input);

  if (parsed.parentId) {
    const parent = await getMediaFolderById(parsed.parentId);
    if (!parent) {
      throw new MediaLibraryNotFoundError("Parent folder not found.");
    }
  }

  return createMediaFolder({ name: parsed.name, parentId: parsed.parentId });
}
