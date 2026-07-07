import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBlogListData } from "@/services/blog/get-public-blog-data";
import { buildBlogCategoryMetadata } from "@/seo/blog";
import { findCategoryBySlug } from "@/server/blog/blog-category.repository";
import { BlogListView } from "@/features/blog/components/blog-list-view";

export const revalidate = 60;

interface PublicBlogCategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PublicBlogCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);

  if (!category) {
    return { title: "Categoría no encontrada — Blog — Eterna Vida" };
  }

  return buildBlogCategoryMetadata(category);
}

export default async function PublicBlogCategoryPage({ params, searchParams }: PublicBlogCategoryPageProps) {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const resolvedParams = await searchParams;

  const data = await getBlogListData({
    page: resolvedParams.page ? Number(resolvedParams.page) : 1,
    categoryId: category.id,
    query: typeof resolvedParams.query === "string" ? resolvedParams.query : undefined,
    tag: undefined,
  });

  return <BlogListView data={data} categorySlug={slug} />;
}
