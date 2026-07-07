"use client";

import Link from "next/link";

import { Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react";

import type { PublicBlogPostDetail } from "@/types/blog";

interface BlogPostViewProps {
  post: PublicBlogPostDetail;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date(value));
}

function ShareButtons({ post }: { post: PublicBlogPostDetail }) {
  const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://eternavida.com.ec";
  const url = `${BASE_URL}/blog/${post.slug}`;
  const text = `${post.title} — Eterna Vida`;

  return (
    <div className="flex items-center gap-3">
      <span className="text-body-sm text-text-tertiary">Compartir:</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] transition-colors hover:bg-[#25D366]/20"
        aria-label="Compartir en WhatsApp"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.553 4.112 1.519 5.839L0 24l6.335-1.652A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.94 0-3.78-.52-5.388-1.505l-.387-.23-3.76.98.999-3.663-.262-.406A9.788 9.788 0 012.18 12c0-5.42 4.4-9.82 9.82-9.82 5.42 0 9.82 4.4 9.82 9.82 0 5.42-4.4 9.82-9.82 9.82z"/></svg>
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] transition-colors hover:bg-[#1877F2]/20"
        aria-label="Compartir en Facebook"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] transition-colors hover:bg-[#1DA1F2]/20"
        aria-label="Compartir en Twitter"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
      </a>
    </div>
  );
}

export function BlogPostView({ post }: BlogPostViewProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1.5 text-body-sm text-text-secondary transition-colors hover:text-brand-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al blog
      </Link>

      {/* Hero */}
      <header className="mb-8">
        {post.category && (
          <Link
            href={`/blog/categoria/${post.category.slug}`}
            className="mb-3 inline-block text-label-xs uppercase tracking-widest text-brand-primary transition-colors hover:text-brand-primaryHover"
          >
            {post.category.name}
          </Link>
        )}

        <h1 className="text-display-sm text-text-primary sm:text-display-md">{post.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-body-sm text-text-secondary">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {post.authorName}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {post.readingTimeMinutes} min de lectura
          </span>
        </div>

        {post.featuredImageUrl && (
          <img
            src={post.featuredImageUrl}
            alt={post.title}
            className="mt-6 w-full rounded-2xl object-cover"
          />
        )}
      </header>

      {/* Content */}
      <div
        className="prose prose-lg max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-brand-primary prose-strong:text-text-primary prose-blockquote:border-brand-primary/30 prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 text-text-tertiary" />
          {post.tags.map((tag) => (
            <span
              key={tag.slug}
              className="rounded-full bg-surface-subtle px-3 py-1 text-label-xs text-text-secondary"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Share */}
      <div className="mt-10 border-t border-border-soft pt-6">
        <ShareButtons post={post} />
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-2xl border border-border-soft bg-surface-canvas p-6 text-center">
        <p className="text-body-lg text-text-primary">¿Te gustó este artículo?</p>
        <p className="mt-1 text-body-md text-text-secondary">Descubre nuestros productos naturales.</p>
        <Link
          href="/productos"
          className="mt-4 inline-flex items-center rounded-lg bg-brand-primary px-6 py-2.5 text-label-sm text-white transition-colors hover:bg-brand-primaryHover"
        >
          Ver productos
        </Link>
      </div>
    </article>
  );
}
