"use client";

import { useState, useCallback, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { StarRating } from "./star-rating";

interface ReviewFormProps {
  productId: string;
  onSubmitted?: () => void;
}

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_MB = 5;

interface UploadedImage {
  file: File;
  preview: string;
  status: "uploading" | "done" | "error";
  url?: string;
}

export function ReviewForm({ productId, onSubmitted }: ReviewFormProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining).filter((f) => {
      if (f.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) return false;
      if (!f.type.startsWith("image/")) return false;
      return true;
    });

    if (toAdd.length === 0) {
      if (e.target) e.target.value = "";
      return;
    }

    const newImages: UploadedImage[] = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "uploading" as const,
    }));

    setImages((prev) => [...prev, ...newImages]);
    if (e.target) e.target.value = "";

    void Promise.all(
      newImages.map(async (img) => {
        try {
          const formData = new FormData();
          formData.append("file", img.file);

          const res = await fetch("/api/reviews/upload-image", {
            method: "POST",
            credentials: "include",
            body: formData,
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error?.message ?? "Error al subir imagen");
          }

          const data = await res.json();
          setImages((prev) =>
            prev.map((i) =>
              i.preview === img.preview
                ? { ...i, status: "done" as const, url: data.data.url }
                : i,
            ),
          );
        } catch {
          setImages((prev) =>
            prev.map((i) =>
              i.preview === img.preview ? { ...i, status: "error" as const } : i,
            ),
          );
        }
      }),
    );
  }, [images.length]);

  const removeImage = useCallback((preview: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.preview === preview);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.preview !== preview);
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (rating === 0 || status === "submitting") return;

      const uploadedUrls = images
        .filter((i) => i.status === "done" && i.url)
        .map((i) => i.url!);

      setStatus("submitting");
      setErrorMessage("");

      try {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productId,
            rating,
            title: title.trim() || null,
            body: body.trim() || null,
            imageUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || "Error al enviar reseña");
        }

        setStatus("success");
        setRating(0);
        setTitle("");
        setBody("");
        images.forEach((i) => URL.revokeObjectURL(i.preview));
        setImages([]);
        onSubmitted?.();
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Error al enviar reseña");
      }
    },
    [productId, rating, title, body, images, status, onSubmitted],
  );

  if (status === "success") {
    return (
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 text-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 h-8 w-8 text-emerald-600" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p className="text-body-md font-medium text-emerald-800">
          ¡Gracias por tu reseña!
        </p>
        <p className="mt-1 text-body-sm text-emerald-700">
          Tu reseña será visible después de ser aprobada.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
        <div className="shrink-0">
          <label className="mb-1 block text-body-sm font-medium text-text-primary">
            Tu calificación *
          </label>
          <StarRating value={rating} onChange={setRating} size="lg" />
          {rating === 0 && status === "error" ? (
            <p className="mt-1 text-body-xs text-status-error">Selecciona una calificación</p>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor="review-title" className="mb-1 block text-body-sm font-medium text-text-primary">
            Título (opcional)
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="Resumen de tu experiencia"
            className="w-full rounded-lg border border-border-soft bg-white px-3.5 py-2 text-body-md text-text-primary placeholder:text-text-muted transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="review-body" className="mb-1.5 block text-body-sm font-medium text-text-primary">
          Tu reseña (opcional)
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={5000}
          rows={4}
          placeholder="Cuéntanos tu experiencia con este producto..."
          className="w-full rounded-lg border border-border-soft bg-white px-3.5 py-2.5 text-body-md text-text-primary placeholder:text-text-muted transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-body-sm font-medium text-text-primary">
          Imágenes <span className="font-normal text-text-muted">(máx. {MAX_IMAGES})</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div
              key={img.preview}
              className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border-soft bg-neutral-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.preview}
                alt="Vista previa"
                className="h-full w-full object-cover"
              />
              {img.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
              {img.status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(img.preview)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition hover:bg-black/70 group-hover:opacity-100"
                aria-label="Eliminar imagen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-border-soft bg-neutral-50 text-text-muted transition hover:border-brand-primary hover:text-brand-primary"
              aria-label="Agregar imagen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="sr-only"
          aria-label="Seleccionar imágenes de reseña"
        />
      </div>

      {status === "error" ? (
        <p className="text-body-sm text-status-error">{errorMessage}</p>
      ) : null}

      <motion.button
        type="submit"
        disabled={rating === 0 || status === "submitting" || images.some((i) => i.status === "uploading")}
        whileTap={reduceMotion ? {} : { scale: 0.975 }}
        className="rounded-full bg-brand-primary px-6 py-2.5 text-body-md font-medium text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        {status === "submitting" ? "Enviando..." : "Enviar reseña"}
      </motion.button>
    </form>
  );
}
