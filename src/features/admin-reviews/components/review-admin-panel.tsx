"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";

type ReviewStatus = "pending" | "approved" | "rejected";

interface ReviewItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  clerkUserId: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  adminResponse: string | null;
  createdAt: string;
}

interface ReviewsResponse {
  items: ReviewItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function ReviewAdminPanel() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "">("");
  const [loading, setLoading] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const fetchReviews = useCallback(async (page: number, status?: ReviewStatus) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status) params.set("status", status);

      const res = await fetch(`/api/admin/reviews?${params}`, { credentials: "include" });
      if (res.ok) {
        const data: ReviewsResponse = (await res.json()).data;
        setReviews(data.items);
        setPagination(data.pagination);
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(1, statusFilter || undefined);
  }, [fetchReviews, statusFilter]);

  const handleStatusChange = async (id: string, status: ReviewStatus) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchReviews(pagination.page, statusFilter || undefined);
      }
    } catch {
      // handle error
    }
  };

  const handleRespond = async (id: string) => {
    if (!responseText.trim()) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminResponse: responseText.trim() }),
      });
      if (res.ok) {
        setRespondingTo(null);
        setResponseText("");
        fetchReviews(pagination.page, statusFilter || undefined);
      }
    } catch {
      // handle error
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta reseña?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        fetchReviews(pagination.page, statusFilter || undefined);
      }
    } catch {
      // handle error
    }
  };

  const statusColors: Record<ReviewStatus, string> = {
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rejected: "border-red-200 bg-red-50 text-red-700",
  };

  const statusLabels: Record<ReviewStatus, string> = {
    pending: "Pendiente",
    approved: "Aprobada",
    rejected: "Rechazada",
  };

  return (
    <div className="space-y-4">
      <section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Contenido</p>
            <h1 className="text-section-lg text-text-primary sm:text-headline-sm">Reseñas</h1>
          </div>
          <div className="text-body-sm text-text-secondary">
            {pagination.total} reseña{pagination.total !== 1 ? "s" : ""}
          </div>
        </div>
      </section>

      <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("")}
            className={`rounded-full border px-3 py-1 text-caption uppercase tracking-[0.14em] transition ${statusFilter === "" ? "border-border-brand bg-surface-brandTint text-text-brand" : "border-border-soft bg-surface-subtle text-text-muted hover:text-text-primary"}`}
          >
            Todas
          </button>
          {(["pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3 py-1 text-caption uppercase tracking-[0.14em] transition ${statusFilter === s ? "border-border-brand bg-surface-brandTint text-text-brand" : "border-border-soft bg-surface-subtle text-text-muted hover:text-text-primary"}`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-body-sm text-text-muted">Cargando...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center">
            <p className="text-body-md text-text-secondary">No hay reseñas{statusFilter ? ` con estado "${statusLabels[statusFilter]}"` : ""}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-border-soft bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-body-md font-semibold text-text-primary">
                        {review.productName}
                      </span>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[0.62rem] font-medium ${statusColors[review.status]}`}>
                        {statusLabels[review.status]}
                      </span>
                      {review.isVerifiedPurchase ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.62rem] font-medium text-emerald-700">
                          Compra verificada
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={star <= review.rating ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth={star <= review.rating ? "0" : "1.5"}
                          className={`h-3.5 w-3.5 ${star <= review.rating ? "text-[#f5a623]" : "text-neutral-300"}`}
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                      <span className="ml-1 text-body-xs text-text-muted">
                        {new Date(review.createdAt).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                    {review.title ? (
                      <p className="text-body-md font-medium text-text-primary">{review.title}</p>
                    ) : null}
                    {review.body ? (
                      <p className="text-body-sm text-text-secondary">{review.body}</p>
                    ) : null}
                    {review.adminResponse ? (
                      <div className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2.5">
                        <p className="text-body-xs font-semibold text-text-primary">Respuesta admin:</p>
                        <p className="mt-0.5 text-body-sm text-text-secondary">{review.adminResponse}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-1.5">
                    {review.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(review.id, "approved")}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(review.id, "rejected")}
                          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[0.68rem] font-medium text-red-700 transition hover:bg-red-100"
                        >
                          Rechazar
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setRespondingTo(respondingTo === review.id ? null : review.id);
                        setResponseText(review.adminResponse ?? "");
                      }}
                      className="rounded-lg border border-border-soft bg-surface-subtle px-2.5 py-1 text-[0.68rem] font-medium text-text-secondary transition hover:text-text-primary"
                    >
                      {review.adminResponse ? "Editar" : "Responder"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(review.id)}
                      className="rounded-lg border border-border-soft bg-surface-subtle px-2.5 py-1 text-[0.68rem] font-medium text-red-500 transition hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {respondingTo === review.id ? (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Escribe una respuesta..."
                      className="flex-1 rounded-lg border border-border-soft px-3 py-2 text-body-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleRespond(review.id)}
                      className="rounded-lg bg-[#5bb446] px-3 py-2 text-body-sm font-medium text-white hover:bg-[#499038]"
                    >
                      Enviar
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fetchReviews(pagination.page - 1, statusFilter || undefined)}
              disabled={pagination.page <= 1}
              className="rounded-full border border-border-soft px-3 py-1.5 text-body-sm text-text-secondary transition hover:bg-surface-soft disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-body-sm text-text-muted">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => fetchReviews(pagination.page + 1, statusFilter || undefined)}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-full border border-border-soft px-3 py-1.5 text-body-sm text-text-secondary transition hover:bg-surface-soft disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
