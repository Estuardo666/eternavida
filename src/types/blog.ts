export type BlogPostStatus = "draft" | "published";

export interface PublicBlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  publishedAt: string;
  readingTimeMinutes: number;
  category: {
    slug: string;
    name: string;
  } | null;
  featuredImageUrl: string | null;
}

export interface PublicBlogPostTag {
  slug: string;
  name: string;
}

export interface PublicBlogPostDetail extends PublicBlogPostSummary {
  content: string;
  tags: PublicBlogPostTag[];
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  viewCount: number;
}

export interface PublicBlogCategorySummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  postCount: number;
}

export interface PublicBlogPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PublicBlogListData {
  posts: PublicBlogPostSummary[];
  pagination: PublicBlogPagination;
  categories: PublicBlogCategorySummary[];
}
