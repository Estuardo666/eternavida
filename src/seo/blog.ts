import type { Metadata } from "next";

import type { PublicBlogPostSummary } from "@/types/blog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eternavida.com.ec";

export function buildBlogIndexMetadata(): Metadata {
  return {
    title: "Blog — Eterna Vida",
    description:
      "Artículos sobre bienestar natural, recetas saludables, consejos de vida consciente y novedades de Eterna Vida.",
  };
}

export function buildBlogPostMetadata(post: PublicBlogPostSummary & { seoTitle?: string | null; seoDescription?: string | null; ogImageUrl?: string | null; canonicalUrl?: string | null; excerpt?: string }): Metadata {
  const title = post.seoTitle || `${post.title} — Blog — Eterna Vida`;
  const description = post.seoDescription || post.excerpt || "";

  return {
    title,
    description,
    alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.authorName],
      ...(post.ogImageUrl || post.featuredImageUrl ? { images: [{ url: post.ogImageUrl || post.featuredImageUrl! }] } : {}),
    },
  };
}

export function buildBlogCategoryMetadata(category: { name: string; description: string; slug: string }): Metadata {
  return {
    title: `${category.name} — Blog — Eterna Vida`,
    description: category.description || `Artículos sobre ${category.name} en el blog de Eterna Vida.`,
  };
}

export function buildBlogPostJsonLd(post: PublicBlogPostDetail): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    author: { "@type": "Person", name: post.authorName },
    datePublished: post.publishedAt,
    image: post.featuredImageUrl || undefined,
    url: `${BASE_URL}/blog/${post.slug}`,
    publisher: {
      "@type": "Organization",
      name: "Eterna Vida",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/media/Logo EV.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/blog/${post.slug}` },
  };
}

// Re-export for use in the page
import type { PublicBlogPostDetail } from "@/types/blog";
