"use client";

import { useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { StarRating } from "./star-rating";

interface ReviewFormProps {
  productId: string;
  onSubmitted?: () => void;
}

export function ReviewForm({ productId, onSubmitted }: ReviewFormProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (rating === 0 || status === "submitting") return;

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
        onSubmitted?.();
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Error al enviar reseña");
      }
    },
    [productId, rating, title, body, status, onSubmitted],
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-body-sm font-medium text-text-primary">
          Tu calificación *
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating === 0 && status === "error" ? (
          <p className="mt-1 text-body-xs text-[#cc5533]">Selecciona una calificación</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="review-title" className="mb-1.5 block text-body-sm font-medium text-text-primary">
          Título (opcional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Resumen de tu experiencia"
          className="w-full rounded-lg border border-border-soft bg-white px-3.5 py-2.5 text-body-md text-text-primary placeholder:text-text-muted transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
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

      {status === "error" ? (
        <p className="text-body-sm text-[#cc5533]">{errorMessage}</p>
      ) : null}

      <motion.button
        type="submit"
        disabled={rating === 0 || status === "submitting"}
        whileTap={reduceMotion ? {} : { scale: 0.975 }}
        className="rounded-full bg-[#5bb446] px-6 py-2.5 text-body-md font-medium text-white transition hover:bg-[#499038] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        {status === "submitting" ? "Enviando..." : "Enviar reseña"}
      </motion.button>
    </form>
  );
}
