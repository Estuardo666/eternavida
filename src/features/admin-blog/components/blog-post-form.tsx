"use client";

import { useCallback, useState, useRef, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Save, Send, ArrowLeft, X } from "lucide-react";

import {
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
  ADMIN_STICKY_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";
import { MediaPickerModal } from "@/features/admin-content/components/media-picker-modal";
import { uploadMediaAsset, registerMediaAsset } from "@/services/admin-content/client";
import { createBlogPostClient, updateBlogPostClient } from "@/services/admin-blog/client";
import { BlockEditor, insertImageToEditor, insertVideoToEditor } from "@/features/admin-blog/components/block-editor";
import { useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { cx } from "@/lib/utils";
import type {
  AdminBlogEditorData,
  AdminBlogPostFormData,
  AdminBlogCategoryItem,
} from "@/types/admin-blog";
import type { AdminMediaAssetSummary } from "@/types/admin-home-content";

type SubmissionState = "idle" | "saving" | "success" | "error";

interface BlogPostFormProps {
  initialData: AdminBlogEditorData;
  mode: "create" | "edit";
}

function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

function computeReadingTime(content: string): number {
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function BlogPostForm({ initialData, mode }: BlogPostFormProps) {
  const router = useRouter();
  const editorRef = useRef<Editor | null>(null);

  const [title, setTitle] = useState(initialData.post?.title ?? "");
  const [slug, setSlug] = useState(initialData.post?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === "edit");
  const [excerpt, setExcerpt] = useState(initialData.post?.excerpt ?? "");
  const [content, setContent] = useState(initialData.post?.content ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initialData.post?.status ?? "draft");
  const [authorName, setAuthorName] = useState(initialData.post?.authorName ?? "Eterna Vida");
  const [categoryId, setCategoryId] = useState(initialData.post?.categoryId ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tagNames, setTagNames] = useState<string[]>(initialData.post?.tagNames ?? []);
  const [featuredImageId, setFeaturedImageId] = useState(initialData.post?.featuredImageId ?? "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(initialData.post?.featuredImageUrl ?? "");
  const [seoTitle, setSeoTitle] = useState(initialData.post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initialData.post?.seoDescription ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialData.post?.canonicalUrl ?? "");
  const [isActive, setIsActive] = useState(initialData.post?.isActive ?? true);
  const [publishedAt, setPublishedAt] = useState(initialData.post?.publishedAt ?? "");

  const [allMediaAssets, setAllMediaAssets] = useState<AdminMediaAssetSummary[]>([]);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"featured" | "editor" | "video">("featured");
  const [submission, setSubmission] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch media assets on mount so the picker isn't empty
  useEffect(() => {
    fetch("/api/admin/media-assets", { credentials: "include" })
      .then((res) => res.json())
      .then((body) => {
        if (body.success && body.data?.mediaAssets) {
          setAllMediaAssets(body.data.mediaAssets);
        }
      })
      .catch(() => {});
  }, []);

  function handleTitleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setTitle(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(e: ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value);
    setSlugManuallyEdited(true);
  }

  function handleAddTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tagNames.includes(trimmed)) {
      setTagNames((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  }

  function handleRemoveTag(name: string) {
    setTagNames((prev) => prev.filter((t) => t !== name));
  }

  function handleMediaPickerOpen(target: "featured" | "editor" | "video") {
    setMediaPickerTarget(target);
    setIsMediaPickerOpen(true);
  }

  function handleMediaSelect(asset: AdminMediaAssetSummary) {
    if (mediaPickerTarget === "featured") {
      setFeaturedImageId(asset.id);
      setFeaturedImageUrl(asset.publicUrl ?? "");
    } else if (mediaPickerTarget === "video") {
      const url = asset.publicUrl ?? `/api/media/${encodeURIComponent(asset.storageKey)}`;
      insertVideoToEditor(editorRef.current, url, asset.posterUrl ?? undefined);
    } else {
      const url = asset.publicUrl ?? `/api/media/${encodeURIComponent(asset.storageKey)}`;
      insertImageToEditor(editorRef.current, url);
    }
    setIsMediaPickerOpen(false);
  }

  const handleMediaUpload = useCallback(
    async (file: File, input: Parameters<typeof uploadMediaAsset>[1]) => {
      const result = await uploadMediaAsset(file, input);
      setAllMediaAssets((prev) => [result, ...prev]);
      return result;
    },
    [],
  );

  async function handleSubmit(submitStatus: "draft" | "published") {
    setSubmission("saving");
    setErrorMessage("");

    try {
      const formData: AdminBlogPostFormData = {
        title,
        slug,
        excerpt,
        content,
        status: submitStatus,
        publishedAt: submitStatus === "published" && publishedAt ? publishedAt : null,
        authorName,
        categoryId: categoryId || null,
        featuredImageId,
        seoTitle,
        seoDescription,
        ogImageId: "",
        canonicalUrl,
        isActive,
        tagNames,
      };

      if (mode === "edit" && initialData.post) {
        await updateBlogPostClient(initialData.post.id, formData);
      } else {
        await createBlogPostClient(formData);
      }

      setSubmission("success");
      setTimeout(() => router.push("/admin/blog/posts"), 800);
    } catch (error) {
      setSubmission("error");
      setErrorMessage(error instanceof Error ? error.message : "Error al guardar.");
    }
  }

  const readingTime = computeReadingTime(content);

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs
        items={[
          { href: "/admin/blog/posts", label: "Blog" },
          { label: mode === "create" ? "Nueva entrada" : "Editar entrada" },
        ]}
      />

      <section className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "flex items-center justify-between")}>
        <div>
          <h1 className="text-section-lg text-text-primary">
            {mode === "create" ? "Nueva entrada" : "Editar entrada"}
          </h1>
          <p className="text-body-md text-text-secondary">
            {readingTime} min de lectura · {content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length} palabras
          </p>
        </div>
        <Link href="/admin/blog/posts" className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Link>
        {initialData.post?.slug && initialData.post.status === "published" && (
          <a
            href={`/blog/${initialData.post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
          >
            Ver post
          </a>
        )}
      </section>

      {submission === "success" && (
        <div className="rounded-lg border border-status-success/30 bg-status-success/5 px-4 py-3 text-body-sm text-status-success">
          Entrada guardada correctamente.
        </div>
      )}

      {submission === "error" && errorMessage && (
        <div className="rounded-lg border border-status-error/30 bg-status-error/5 px-4 py-3 text-body-sm text-status-error">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main content */}
        <div className="space-y-5">
          {/* Title */}
          <div className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm text-text-secondary">Título</span>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Título de la entrada..."
                className="w-full rounded-xl border border-border-soft bg-surface-canvas px-4 py-3 text-heading-md text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
              />
            </label>
          </div>

          {/* Slug */}
          <div className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm text-text-secondary">Slug (URL)</span>
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="slug-de-la-entrada"
                className="w-full rounded-xl border border-border-soft bg-surface-canvas px-4 py-3 font-mono text-body-md text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
              />
            </label>
            <p className="mt-1 text-caption text-text-tertiary">/blog/{slug || "..."}</p>
          </div>

          {/* Excerpt */}
          <div className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm text-text-secondary">Extracto</span>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Resumen corto del post..."
                rows={3}
                className="w-full rounded-xl border border-border-soft bg-surface-canvas px-4 py-3 text-body-md text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
              />
            </label>
          </div>

          {/* Content editor */}
          <div className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <span className="mb-2 block text-body-sm text-text-secondary">Contenido</span>
            <BlockEditor
              content={content}
              onChange={setContent}
              onOpenMediaPicker={() => handleMediaPickerOpen("editor")}
              onOpenVideoPicker={() => handleMediaPickerOpen("video")}
              editorRef={editorRef}
              placeholder="Escribe el contenido del post..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Publish */}
          <div className={cx(ADMIN_STICKY_PANEL_SURFACE_CLASS_NAME, "space-y-4")}>
            <p className="text-label-sm text-text-primary">Publicación</p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSubmit("draft")}
                disabled={submission === "saving" || !title.trim() || !slug.trim()}
                className={cx(ADMIN_BUTTON_SECONDARY_CLASS_NAME, "flex-1")}
              >
                <Save className="mr-2 h-4 w-4" />
                Borrador
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("published")}
                disabled={submission === "saving" || !title.trim() || !slug.trim()}
                className={cx(ADMIN_BUTTON_PRIMARY_CLASS_NAME, "flex-1")}
              >
                <Send className="mr-2 h-4 w-4" />
                Publicar
              </button>
            </div>
          </div>

          {/* Category */}
          <div className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm text-text-secondary">Categoría</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-border-soft bg-surface-canvas px-3.5 py-2.5 text-body-md text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
              >
                <option value="">Sin categoría</option>
                {initialData.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Tags */}
          <div className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <span className="text-body-sm text-text-secondary">Etiquetas</span>
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                placeholder="Añadir etiqueta..."
                className="flex-1 rounded-xl border border-border-soft bg-surface-canvas px-3.5 py-2 text-body-md text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
              />
              <button type="button" onClick={handleAddTag} className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}>+</button>
            </div>
            {tagNames.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tagNames.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-2.5 py-1 text-label-xs text-brand-primary">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-status-error">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Author */}
          <div className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm text-text-secondary">Autor</span>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full rounded-xl border border-border-soft bg-surface-canvas px-3.5 py-2.5 text-body-md text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
              />
            </label>
          </div>

          {/* Featured Image */}
          <div className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <span className="text-body-sm text-text-secondary">Imagen destacada</span>
            {featuredImageUrl ? (
              <div className="mt-2 space-y-2">
                <img src={featuredImageUrl} alt="Imagen destacada" className="w-full rounded-lg object-cover" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleMediaPickerOpen("featured")} className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}>Cambiar</button>
                  <button type="button" onClick={() => { setFeaturedImageId(""); setFeaturedImageUrl(""); }} className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}>Quitar</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => handleMediaPickerOpen("featured")} className={cx(ADMIN_BUTTON_SECONDARY_CLASS_NAME, "mt-2 w-full")}>
                Seleccionar imagen
              </button>
            )}
          </div>

          {/* SEO */}
          <div className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <p className="mb-3 text-label-sm text-text-primary">SEO</p>
            <div className="space-y-3">
              <label className="flex flex-col gap-1">
                <span className="text-caption text-text-tertiary">Meta Title</span>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || "Título SEO..."}
                  className="w-full rounded-lg border border-border-soft bg-surface-subtle px-3 py-2 text-body-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-caption text-text-tertiary">Meta Description</span>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder={excerpt || "Descripción SEO..."}
                  rows={2}
                  className="w-full rounded-lg border border-border-soft bg-surface-subtle px-3 py-2 text-body-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-caption text-text-tertiary">Canonical URL</span>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border-soft bg-surface-subtle px-3 py-2 text-body-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        onUpload={handleMediaUpload}
        mediaAssets={allMediaAssets}
        selectedAssetId={mediaPickerTarget === "featured" ? featuredImageId : undefined}
        title={mediaPickerTarget === "featured" ? "Seleccionar imagen destacada" : mediaPickerTarget === "video" ? "Insertar video en el contenido" : "Insertar imagen en el contenido"}
      />
    </div>
  );
}
