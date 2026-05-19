import { z } from "zod";

const folderNameSchema = z.string().trim().min(1, "Folder name is required").max(100, "Folder name must be 100 characters or fewer");

export const createFolderSchema = z.object({
  name: folderNameSchema,
  parentId: z.string().cuid().optional(),
});

export const updateFolderSchema = z
  .object({
    name: folderNameSchema.optional(),
    parentId: z.string().cuid().nullable().optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.parentId !== undefined,
    "At least one of name or parentId must be provided",
  );

export const updateMediaAssetSchema = z.object({
  folderId: z.string().cuid().nullable().optional(),
  altText: z.string().trim().max(500).optional(),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type UpdateMediaAssetInput = z.infer<typeof updateMediaAssetSchema>;
