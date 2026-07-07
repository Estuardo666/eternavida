import "server-only";

import { prisma } from "@/server/db/prisma";

export async function listAllCategories() {
  return prisma.blogCategory.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
}

export async function listActiveCategories() {
  return prisma.blogCategory.findMany({
    where: { isActive: true },
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
}

export async function findCategoryById(id: string) {
  return prisma.blogCategory.findUnique({
    where: { id },
    include: { _count: { select: { posts: true } } },
  });
}

export async function findCategoryBySlug(slug: string) {
  return prisma.blogCategory.findUnique({ where: { slug } });
}

export async function createCategory(data: { name: string; slug: string; description: string; isActive: boolean }) {
  return prisma.blogCategory.create({ data });
}

export async function updateCategory(id: string, data: Partial<{ name: string; slug: string; description: string; isActive: boolean }>) {
  return prisma.blogCategory.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return prisma.blogCategory.delete({ where: { id } });
}

export async function findConflictingCategorySlug(slug: string, excludeId?: string) {
  return prisma.blogCategory.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
}
