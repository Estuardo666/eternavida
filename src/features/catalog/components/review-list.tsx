"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { StarRating } from "./star-rating";
import type { PublicReviewAggregate } from "@/types/public-catalog";

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  authorName: string;
  createdAt: string;
  adminResponse: string | null;
  adminRespondedAt: string | null;
}

interface ReviewListProps {
  productSlug: string;
  aggregate: PublicReviewAggregate | null;
}

export function ReviewList({ productSlug, aggregate }: ReviewListProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const fetchReviews = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products/${productSlug}/reviews?page=${pageNum}&limit=10`,
        { credentials: "include" },
      );
      if (res.ok) {
        const data = await res.json();
        setReviews(data.data.items);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }, [productSlug]);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  useEffect(() => {
    if (page > 1) fetchReviews(page);
  }, [page, fetchReviews]);

  if (!aggregate || aggregate.totalReviews === 0) {
    if (initialLoaded && reviews.length === 0) {
      return (
        <div className="rounded-xl border border-border-soft bg-white p-6 text-center">
          <p className="text-body-md text-text-secondary">
            Este producto aún no tiene reseñas. ¡Sé el primero en opinar!
          </p>
        </div>
      );
    }
    return null;
  }

  const maxBar = Math.max(...Object.values(aggregate.ratingDistribution), 1);

  return (
    <div className="space-y-6">
      {/* Aggregate summary */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[2.5rem] font-bold leading-none text-text-primary">
            {aggregate.averageRating}
          </span>
          <StarRating value={Math.round(aggregate.averageRating)} readonly size="md" />
          <span className="text-body-sm text-text-secondary">
            {aggregate.totalReviews} reseña{aggregate.totalReviews !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = aggregate.ratingDistribution[star] ?? 0;
            const percent = maxBar > 0 ? (count / maxBar) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-3 text-right text-body-xs text-text-muted">{star}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-[#f5a623]" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-[#f5a623] transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-6 text-right text-body-xs text-text-muted">{count}</span>
              </div>
            );
          })}
        </div>

        {aggregate.verifiedCount > 0 ? (
          <div className="flex items-center gap-1.5 self-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-body-xs font-medium text-emerald-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {aggregate.verifiedCount} compra{aggregate.verifiedCount !== 1 ? "s" : ""} verificada{aggregate.verifiedCount !== 1 ? "s" : ""}
          </div>
        ) : null}
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.article
            key={review.id}
            initial={reduceMotion ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-border-soft bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <StarRating value={review.rating} readonly size="sm" />
                  {review.isVerifiedPurchase ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.62rem] font-medium text-emerald-700">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-2.5 w-2.5" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Compra verificada
                    </span>
                  ) : null}
                </div>
                {review.title ? (
                  <h4 className="text-body-md font-semibold text-text-primary">
                    {review.title}
                  </h4>
                ) : null}
              </div>
              <time className="shrink-0 text-body-xs text-text-muted" dateTime={review.createdAt}>
                {new Date(review.createdAt).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>

            {review.body ? (
              <p className="mt-2 text-body-sm leading-relaxed text-text-secondary">
                {review.body}
              </p>
            ) : null}

            {review.adminResponse ? (
              <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-body-xs font-semibold text-text-primary">
                  Respuesta de Dermatologika
                </p>
                <p className="mt-1 text-body-sm text-text-secondary">
                  {review.adminResponse}
                </p>
              </div>
            ) : null}
          </motion.article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="rounded-full border border-border-soft px-3 py-1.5 text-body-sm text-text-secondary transition hover:bg-surface-soft disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-body-sm text-text-muted">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="rounded-full border border-border-soft px-3 py-1.5 text-body-sm text-text-secondary transition hover:bg-surface-soft disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      ) : null}
    </div>
  );
}
