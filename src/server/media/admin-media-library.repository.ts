import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

const mediaFolderWithCountsSelect = {
  id: true,
  name: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      children: true,
      assets: true,
    },
  },
} satisfies Prisma.MediaFolderSelect;

export async function listMediaFolders() {
  return prisma.mediaFolder.findMany({
    select: mediaFolderWithCountsSelect,
    orderBy: { name: "asc" },
  });
}

export async function getMediaFolderById(id: string) {
  return prisma.mediaFolder.findUnique({
    where: { id },
    select: mediaFolderWithCountsSelect,
  });
}

export async function createMediaFolder(data: { name: string; parentId?: string | undefined }) {
  return prisma.mediaFolder.create({
    data: {
      name: data.name,
      parentId: data.parentId ?? null,
    },
    select: mediaFolderWithCountsSelect,
  });
}

export async function updateMediaFolder(
  id: string,
  data: { name?: string | undefined; parentId?: string | null | undefined },
) {
  return prisma.mediaFolder.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
    },
    select: mediaFolderWithCountsSelect,
  });
}

export async function deleteMediaFolder(id: string) {
  return prisma.mediaFolder.delete({ where: { id } });
}

export async function getMediaAssetById(id: string) {
  return prisma.mediaAsset.findUnique({ where: { id } });
}

export async function updateMediaAsset(
  id: string,
  data: { folderId?: string | null | undefined; altText?: string | undefined },
) {
  return prisma.mediaAsset.update({
    where: { id },
    data: {
      ...(data.folderId !== undefined ? { folderId: data.folderId } : {}),
      ...(data.altText !== undefined ? { altText: data.altText.trim() || null } : {}),
    },
  });
}

export async function deleteMediaAsset(id: string) {
  return prisma.mediaAsset.delete({ where: { id } });
}

export async function listMediaAssets(folderId?: string | null | "all") {
  const where: Prisma.MediaAssetWhereInput =
    folderId === undefined || folderId === "all"
      ? {}
      : folderId === null
        ? { folderId: null }
        : { folderId };

  return prisma.mediaAsset.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}
