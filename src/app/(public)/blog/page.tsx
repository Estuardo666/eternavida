import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBlogListData } from "@/services/blog/get-public-blog-data";
import { buildBlogIndexMetadata } from "@/seo/blog";
import { BlogListView } from "@/features/blog/components/blog-list-view";

export const revalidate = 60;

export const metadata: Metadata = buildBlogIndexMetadata();

interface PublicBlogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PublicBlogPage({ searchParams }: PublicBlogPageProps) {
  const params = await searchParams;

  const data = await getBlogListData({
    page: params.page ? Number(params.page) : 1,
    categoryId: typeof params.categoryId === "string" ? params.categoryId : null,
    query: typeof params.query === "string" ? params.query : undefined,
    tag: undefined,
  });

  return <BlogListView data={data} />;
}
