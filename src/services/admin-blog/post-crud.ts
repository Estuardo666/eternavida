import "server-only";

import {
  createPost,
  updatePost,
  deletePost,
  findConflictingPostSlug,
} from "@/server/blog/blog-post.repository";
import { syncPostTags } from "@/server/blog/blog-tag.repository";
import { assertMediaAssetExists } from "./blog-shared";
import type { AdminBlogPostFormData } from "@/types/admin-blog";

export class BlogConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlogConflictError";
  }
}

function computeReadingTime(content: string): number {
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function normalizeOptionalString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeMediaId(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function createBlogPost(data: AdminBlogPostFormData) {
  const existing = await findConflictingPostSlug(data.slug);
  if (existing) {
    throw new BlogConflictError(`A post with slug "${data.slug}" already exists.`);
  }

  if (data.featuredImageId.trim()) {
    await assertMediaAssetExists(data.featuredImageId.trim());
  }

  const readingTime = computeReadingTime(data.content);
  const publishedAt = data.status === "published" && data.publishedAt
    ? new Date(data.publishedAt)
    : data.status === "published"
      ? new Date()
      : null;

  const post = await createPost({
    title: data.title.trim(),
    slug: data.slug.trim(),
    excerpt: data.excerpt.trim(),
    content: data.content,
    status: data.status,
    publishedAt,
    authorName: data.authorName.trim() || "Eterna Vida",
    categoryId: normalizeMediaId(data.categoryId ?? ""),
    featuredImageId: normalizeMediaId(data.featuredImageId),
    seoTitle: normalizeOptionalString(data.seoTitle),
    seoDescription: normalizeOptionalString(data.seoDescription),
    ogImageId: normalizeMediaId(data.ogImageId),
    canonicalUrl: normalizeOptionalString(data.canonicalUrl),
    isActive: data.isActive,
    readingTimeMinutes: readingTime,
  });

  await syncPostTags(post.id, data.tagNames);

  return post;
}

export async function updateBlogPost(id: string, data: AdminBlogPostFormData) {
  const existing = await findConflictingPostSlug(data.slug, id);
  if (existing) {
    throw new BlogConflictError(`A post with slug "${data.slug}" already exists.`);
  }

  const readingTime = computeReadingTime(data.content);
  const publishedAt = data.status === "published" && data.publishedAt
    ? new Date(data.publishedAt)
    : data.status === "published"
      ? new Date()
      : null;

  const post = await updatePost(id, {
    title: data.title.trim(),
    slug: data.slug.trim(),
    excerpt: data.excerpt.trim(),
    content: data.content,
    status: data.status,
    publishedAt,
    authorName: data.authorName.trim() || "Eterna Vida",
    categoryId: normalizeMediaId(data.categoryId ?? ""),
    featuredImageId: normalizeMediaId(data.featuredImageId),
    seoTitle: normalizeOptionalString(data.seoTitle),
    seoDescription: normalizeOptionalString(data.seoDescription),
    ogImageId: normalizeMediaId(data.ogImageId),
    canonicalUrl: normalizeOptionalString(data.canonicalUrl),
    isActive: data.isActive,
    readingTimeMinutes: readingTime,
  });

  await syncPostTags(post.id, data.tagNames);

  return post;
}

export async function deleteBlogPost(id: string) {
  return deletePost(id);
}
