import type { BlogPostStatus } from "@/types/blog";

export interface AdminBlogTagItem {
  id: string;
  slug: string;
  name: string;
}

export interface AdminBlogCategoryItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  isActive: boolean;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: BlogPostStatus;
  publishedAt: string | null;
  authorName: string;
  categoryId: string | null;
  categoryName: string | null;
  featuredImageId: string | null;
  featuredImageUrl: string | null;
  featuredImageAltText: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageId: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  isActive: boolean;
  viewCount: number;
  readingTimeMinutes: number;
  tagNames: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminBlogPostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: BlogPostStatus;
  publishedAt: string | null;
  authorName: string;
  categoryId: string | null;
  featuredImageId: string;
  seoTitle: string;
  seoDescription: string;
  ogImageId: string;
  canonicalUrl: string;
  isActive: boolean;
  tagNames: string[];
}

export interface AdminBlogCategoryFormData {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

export interface AdminBlogEditorData {
  post: AdminBlogPostItem | null;
  categories: AdminBlogCategoryItem[];
  tags: AdminBlogTagItem[];
}

export interface AdminBlogListData {
  posts: AdminBlogPostItem[];
  categories: AdminBlogCategoryItem[];
  totalCount: number;
  filteredCount: number;
  publishedCount: number;
  draftCount: number;
}

export interface AdminBlogListSearchParams {
  query: string;
  status: "all" | BlogPostStatus;
  categoryId: string;
  page: number;
  pageSize: number;
}
