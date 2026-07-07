import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBlogPostBySlug } from "@/services/blog/get-public-blog-data";
import { buildBlogPostMetadata, buildBlogPostJsonLd } from "@/seo/blog";
import { BlogPostView } from "@/features/blog/components/blog-post-view";

export const revalidate = 60;

interface PublicBlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicBlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Post no encontrado — Blog — Eterna Vida" };
  }

  return buildBlogPostMetadata(post);
}

export default async function PublicBlogPostPage({ params }: PublicBlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = buildBlogPostJsonLd(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostView post={post} />
    </>
  );
}
