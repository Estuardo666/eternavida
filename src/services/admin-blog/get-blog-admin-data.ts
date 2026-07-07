import "server-only";

import { listAllPosts, findPostById, findPostBySlug } from "@/server/blog/blog-post.repository";
import { listAllCategories } from "@/server/blog/blog-category.repository";
import { listAllTags } from "@/server/blog/blog-tag.repository";
import type {
  AdminBlogPostItem,
  AdminBlogListData,
  AdminBlogEditorData,
} from "@/types/admin-blog";

function toNumber(value: number | { toNumber(): number }): number {
  return typeof value === "number" ? value : value.toNumber();
}

function mapPostItem(post: {
  id: string;
  slug: string;
  title: string;
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
  viewCount: number;
  readingTimeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; slug: string; name: string } | null;
  tags: { tag: { id: string; slug: string; name: string } }[];
  featuredImage: { publicUrl: string | null; altText: string | null } | null;
  ogImage: { publicUrl: string | null } | null;
}): AdminBlogPostItem {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    status: post.status,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    authorName: post.authorName,
    categoryId: post.categoryId,
    categoryName: post.category?.name ?? null,
    featuredImageId: post.featuredImageId,
    featuredImageUrl: post.featuredImage?.publicUrl ?? null,
    featuredImageAltText: post.featuredImage?.altText ?? "",
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    ogImageId: post.ogImageId,
    ogImageUrl: post.ogImage?.publicUrl ?? null,
    canonicalUrl: post.canonicalUrl,
    isActive: post.isActive,
    viewCount: post.viewCount,
    readingTimeMinutes: post.readingTimeMinutes,
    tagNames: post.tags.map((t) => t.tag.name),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export async function getBlogAdminListData(searchParams: {
  page?: number;
  status?: string | undefined;
  categoryId?: string | null | undefined;
  query?: string | undefined;
}): Promise<AdminBlogListData> {
  const page = searchParams.page && searchParams.page > 0 ? searchParams.page : 1;

  const { items, totalCount, publishedCount, draftCount } = await listAllPosts({
    page,
    pageSize: 20,
    status: searchParams.status,
    categoryId: searchParams.categoryId ?? null,
    query: searchParams.query,
  });

  return {
    posts: items.map(mapPostItem),
    categories: [],
    totalCount,
    filteredCount: items.length,
    publishedCount,
    draftCount,
  };
}

export async function getBlogPostEditorData(id?: string): Promise<AdminBlogEditorData> {
  const [postRecord, categoryRecords, tagRecords] = await Promise.all([
    id ? findPostById(id) : null,
    listAllCategories(),
    listAllTags(),
  ]);

  const post = postRecord ? mapPostItem(postRecord) : null;

  return {
    post,
    categories: categoryRecords.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      isActive: c.isActive,
      postCount: c._count.posts,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    tags: tagRecords.map((t) => ({ id: t.id, slug: t.slug, name: t.name })),
  };
}

export async function getBlogPostEditorDataBySlug(slug: string): Promise<AdminBlogEditorData> {
  const [postRecord, categoryRecords, tagRecords] = await Promise.all([
    findPostBySlug(slug),
    listAllCategories(),
    listAllTags(),
  ]);

  const post = postRecord ? mapPostItem(postRecord) : null;

  return {
    post,
    categories: categoryRecords.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      isActive: c.isActive,
      postCount: c._count.posts,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    tags: tagRecords.map((t) => ({ id: t.id, slug: t.slug, name: t.name })),
  };
}

export { mapPostItem };
