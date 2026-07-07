import "server-only";

import {
  createCategory,
  updateCategory,
  deleteCategory,
  findConflictingCategorySlug,
} from "@/server/blog/blog-category.repository";
import { prisma } from "@/server/db/prisma";
import type { AdminBlogCategoryFormData } from "@/types/admin-blog";

export class BlogCategoryConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlogCategoryConflictError";
  }
}

export async function createBlogCategory(data: AdminBlogCategoryFormData) {
  const existing = await findConflictingCategorySlug(data.slug);
  if (existing) {
    throw new BlogCategoryConflictError(`A category with slug "${data.slug}" already exists.`);
  }

  return createCategory({
    name: data.name.trim(),
    slug: data.slug.trim(),
    description: data.description.trim(),
    isActive: data.isActive,
  });
}

export async function updateBlogCategory(id: string, data: AdminBlogCategoryFormData) {
  const existing = await findConflictingCategorySlug(data.slug, id);
  if (existing) {
    throw new BlogCategoryConflictError(`A category with slug "${data.slug}" already exists.`);
  }

  return updateCategory(id, {
    name: data.name.trim(),
    slug: data.slug.trim(),
    description: data.description.trim(),
    isActive: data.isActive,
  });
}

export async function deleteBlogCategory(id: string) {
  const postCount = await prisma.blogPost.count({ where: { categoryId: id } });
  if (postCount > 0) {
    throw new Error(`Cannot delete category with ${postCount} associated posts.`);
  }

  return deleteCategory(id);
}
