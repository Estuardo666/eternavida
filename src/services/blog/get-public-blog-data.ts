import "server-only";

import { listPublishedPosts, findPublishedPostBySlug } from "@/server/blog/blog-post.repository";
import { listActiveCategories } from "@/server/blog/blog-category.repository";
import type {
  PublicBlogListData,
  PublicBlogPostDetail,
  PublicBlogPostSummary,
  PublicBlogCategorySummary,
} from "@/types/blog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eternavida.com.ec";
const DEFAULT_PAGE_SIZE = 12;

function mapMediaUrl(url: string | null | undefined): string | null {
  return url ?? null;
}

function mapPostSummary(post: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  publishedAt: Date | null;
  readingTimeMinutes: number;
  category: { slug: string; name: string } | null;
  featuredImage: { publicUrl: string | null } | null;
}): PublicBlogPostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    authorName: post.authorName,
    publishedAt: post.publishedAt?.toISOString() ?? post.publishedAt?.toString() ?? "",
    readingTimeMinutes: post.readingTimeMinutes,
    category: post.category ? { slug: post.category.slug, name: post.category.name } : null,
    featuredImageUrl: mapMediaUrl(post.featuredImage?.publicUrl),
  };
}

function computeReadingTime(content: string): number {
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export async function getBlogListData(searchParams: {
  page?: number;
  categoryId?: string | null | undefined;
  tag?: string | null | undefined;
  query?: string | undefined;
}): Promise<PublicBlogListData> {
  const page = searchParams.page && searchParams.page > 0 ? searchParams.page : 1;
  const pageSize = DEFAULT_PAGE_SIZE;

  const [{ items, totalCount }, categoryRecords] = await Promise.all([
    listPublishedPosts({
      page,
      pageSize,
      categoryId: searchParams.categoryId ?? null,
      tagSlug: searchParams.tag ?? null,
      query: searchParams.query,
    }),
    listActiveCategories(),
  ]);

  const posts = items.map(mapPostSummary);

  const categories: PublicBlogCategorySummary[] = categoryRecords.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    postCount: c._count.posts,
  }));

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    posts,
    pagination: {
      page,
      pageSize,
      totalItems: totalCount,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
    categories,
  };
}

export async function getBlogPostBySlug(slug: string): Promise<PublicBlogPostDetail | null> {
  const post = await findPublishedPostBySlug(slug);
  if (!post) return null;

  return {
    ...mapPostSummary(post),
    content: post.content,
    tags: post.tags.map((t) => ({ slug: t.tag.slug, name: t.tag.name })),
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    ogImageUrl: mapMediaUrl(post.ogImage?.publicUrl),
    canonicalUrl: post.canonicalUrl,
    viewCount: post.viewCount,
  };
}
