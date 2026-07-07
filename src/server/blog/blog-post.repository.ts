import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

const blogPostInclude = {
  category: { select: { id: true, slug: true, name: true } },
  tags: { include: { tag: { select: { id: true, slug: true, name: true } } } },
  featuredImage: true,
  ogImage: true,
} satisfies Prisma.BlogPostInclude;

export async function listPublishedPosts(options: {
  page: number;
  pageSize: number;
  categoryId?: string | null | undefined;
  tagSlug?: string | null | undefined;
  query?: string | undefined;
}) {
  const { page, pageSize, categoryId, tagSlug, query } = options;
  const skip = (page - 1) * pageSize;

  const where: Prisma.BlogPostWhereInput = {
    status: "published",
    isActive: true,
    ...(categoryId ? { categoryId } : {}),
    ...(tagSlug
      ? { tags: { some: { tag: { slug: tagSlug } } } }
      : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [totalCount, items] = await prisma.$transaction([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      include: blogPostInclude,
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  return { items, totalCount };
}

export async function findPublishedPostBySlug(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug, status: "published", isActive: true },
    include: blogPostInclude,
  });

  if (post) {
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return post;
}

export async function listAllPosts(options: {
  page: number;
  pageSize: number;
  status?: string | undefined;
  categoryId?: string | null | undefined;
  query?: string | undefined;
}) {
  const { page, pageSize, status, categoryId, query } = options;
  const skip = (page - 1) * pageSize;

  const where: Prisma.BlogPostWhereInput = {
    ...(status === "published" ? { status: "published" } : status === "draft" ? { status: "draft" } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [totalCount, publishedCount, draftCount, items] = await prisma.$transaction([
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: "published" } }),
    prisma.blogPost.count({ where: { status: "draft" } }),
    prisma.blogPost.findMany({
      where,
      include: blogPostInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  return { items, totalCount, publishedCount, draftCount };
}

export async function findPostById(id: string) {
  return prisma.blogPost.findUnique({
    where: { id },
    include: blogPostInclude,
  });
}

export async function findPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug },
    include: blogPostInclude,
  });
}

export async function findConflictingPostSlug(slug: string, excludeId?: string) {
  return prisma.blogPost.findFirst({
    where: {
      slug,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
}

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
  publishedAt: Date | null;
  authorName: string;
  categoryId: string | null;
  featuredImageId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageId: string | null;
  canonicalUrl: string | null;
  isActive: boolean;
  readingTimeMinutes: number;
}) {
  return prisma.blogPost.create({ data, include: blogPostInclude });
}

export async function updatePost(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    status: "draft" | "published";
    publishedAt: Date | null;
    authorName: string;
    categoryId: string | null;
    featuredImageId: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    ogImageId: string | null;
    canonicalUrl: string | null;
    isActive: boolean;
    readingTimeMinutes: number;
  }>,
) {
  return prisma.blogPost.update({ where: { id }, data, include: blogPostInclude });
}

export async function deletePost(id: string) {
  return prisma.blogPost.delete({ where: { id } });
}
