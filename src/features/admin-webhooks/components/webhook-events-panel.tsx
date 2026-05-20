"use client";

import { useEffect, useState } from "react";

import { ADMIN_COMPACT_FIELD_CLASS_NAME } from "@/components/admin/form-styles";
import {
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";

const STATUS_OPTIONS = ["", "pending", "retrying", "failed", "delivered"] as const;

type WebhookEventRow = {
  id: string;
  eventType: string;
  status: "pending" | "retrying" | "failed" | "delivered";
  attemptCount: number;
  lastResponseStatus: number | null;
  lastError: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
  } | null;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "No se pudo completar la operacion.";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildParams(filters: { page: number; pageSize: number; status: string; eventType: string; orderNumber: string }) {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("pageSize", String(filters.pageSize));
  if (filters.status) params.set("status", filters.status);
  if (filters.eventType.trim()) params.set("eventType", filters.eventType.trim());
  if (filters.orderNumber.trim()) params.set("orderNumber", filters.orderNumber.trim());
  return params;
}

export function WebhookEventsPanel() {
  const [events, setEvents] = useState<WebhookEventRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [eventType, setEventType] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadEvents() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/webhook-events?${buildParams({ page, pageSize, status, eventType, orderNumber }).toString()}`);
      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        data?: { items: WebhookEventRow[]; total: number };
      };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? "No se pudieron cargar los eventos.");
      }

      setEvents(payload.data.items);
      setTotal(payload.data.total);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setEvents([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, [page, pageSize, status, eventType, orderNumber]);

  async function retryEvents(eventIds?: string[]) {
    setIsRetrying(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/webhooks/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventIds?.length ? { eventIds } : {}),
      });
      const payload = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "No se pudo reintentar el webhook.");
      }

      await loadEvents();
    } catch (retryError) {
      setError(getErrorMessage(retryError));
    } finally {
      setIsRetrying(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <AdminBreadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Integraciones" },
            { label: "Eventos de webhooks" },
          ]}
        />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-section-md font-semibold text-text-primary">Eventos de webhooks</h1>
            <p className="mt-1 max-w-3xl text-body-sm text-text-secondary">
              Revisa entregas, errores HTTP y reintenta eventos fallidos o pendientes.
            </p>
          </div>
          <button type="button" className={ADMIN_BUTTON_PRIMARY_CLASS_NAME} onClick={() => void retryEvents()} disabled={isRetrying}>
            {isRetrying ? "Reintentando..." : "Reintentar fallidos"}
          </button>
        </div>
      </div>

      <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
        {error ? (
          <p className="mb-4 rounded-2xl border border-status-error/20 bg-status-error/5 px-4 py-3 text-body-sm text-status-error">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={ADMIN_COMPACT_FIELD_CLASS_NAME}>
            <option value="">Todos los estados</option>
            {STATUS_OPTIONS.filter(Boolean).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            value={eventType}
            onChange={(event) => setEventType(event.target.value)}
            className={ADMIN_COMPACT_FIELD_CLASS_NAME}
            placeholder="order.updated"
          />
          <input
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            className={ADMIN_COMPACT_FIELD_CLASS_NAME}
            placeholder="DRM-..."
          />
          <button type="button" className={ADMIN_BUTTON_SECONDARY_CLASS_NAME} onClick={() => void loadEvents()}>
            Aplicar filtros
          </button>
        </div>

        {isLoading ? (
          <div className="mt-4 rounded-2xl border border-dashed border-[#c8d9c4] p-8 text-center text-text-secondary">
            Cargando eventos...
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-body-sm">
              <thead className="text-text-secondary">
                <tr>
                  <th className="border-b border-[#d8e3d4] px-3 py-3">Fecha</th>
                  <th className="border-b border-[#d8e3d4] px-3 py-3">Evento</th>
                  <th className="border-b border-[#d8e3d4] px-3 py-3">Pedido</th>
                  <th className="border-b border-[#d8e3d4] px-3 py-3">Estado</th>
                  <th className="border-b border-[#d8e3d4] px-3 py-3 text-right">Intentos</th>
                  <th className="border-b border-[#d8e3d4] px-3 py-3 text-right">HTTP</th>
                  <th className="border-b border-[#d8e3d4] px-3 py-3">Ultimo error</th>
                  <th className="border-b border-[#d8e3d4] px-3 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-[#edf2eb] align-top">
                    <td className="px-3 py-4 text-text-secondary">{formatDate(event.createdAt)}</td>
                    <td className="px-3 py-4 font-medium text-text-primary">{event.eventType}</td>
                    <td className="px-3 py-4 text-text-secondary">{event.order?.orderNumber ?? "-"}</td>
                    <td className="px-3 py-4 text-text-secondary">{event.status}</td>
                    <td className="px-3 py-4 text-right text-text-secondary">{event.attemptCount}</td>
                    <td className="px-3 py-4 text-right text-text-secondary">{event.lastResponseStatus ?? "-"}</td>
                    <td className="px-3 py-4 text-caption text-status-error">{event.lastError ?? "-"}</td>
                    <td className="px-3 py-4">
                      <button
                        type="button"
                        className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
                        onClick={() => void retryEvents([event.id])}
                        disabled={isRetrying}
                      >
                        Reintentar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#dfe9dc] pt-4 text-body-sm text-text-secondary">
          <p>
            Pagina {page} de {totalPages} · {total} eventos
          </p>
          <div className="flex items-center gap-3">
            <button type="button" className={ADMIN_BUTTON_SECONDARY_CLASS_NAME} onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>
              Anterior
            </button>
            <button type="button" className={ADMIN_BUTTON_SECONDARY_CLASS_NAME} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages}>
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
