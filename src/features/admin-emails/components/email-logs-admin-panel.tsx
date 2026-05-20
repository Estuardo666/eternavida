"use client";

import { useEffect, useState } from "react";

import { ADMIN_COMPACT_FIELD_CLASS_NAME } from "@/components/admin/form-styles";
import {
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_INSET_CARD_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";

const EMAIL_STATUS_OPTIONS = [
  "all",
  "queued",
  "sent",
  "delivered",
  "bounced",
  "failed",
  "skipped",
] as const;

const TEMPLATE_OPTIONS = [
  { value: "", label: "Todas las plantillas" },
  { value: "test_email", label: "Correo de prueba" },
  { value: "order_confirmation", label: "Confirmación de pedido" },
  { value: "order_status_update", label: "Cambio de estado" },
  { value: "order_admin_notification", label: "Pedido admin" },
  { value: "contact_lead_notification", label: "Lead" },
  { value: "welcome_user", label: "Bienvenida" },
] as const;

type EmailStatusFilter = (typeof EMAIL_STATUS_OPTIONS)[number];

type EmailLogRecord = {
  id: string;
  recipient: string;
  templateKey: string;
  subject: string;
  status: Exclude<EmailStatusFilter, "all">;
  resendId: string | null;
  errorMessage: string | null;
  createdAt: string;
};

const STATUS_LABELS: Record<Exclude<EmailStatusFilter, "all">, string> = {
  queued: "En cola",
  sent: "Enviado",
  delivered: "Entregado",
  bounced: "Rebotado",
  failed: "Fallido",
  skipped: "Saltado",
};

const STATUS_CLASS_NAMES: Record<Exclude<EmailStatusFilter, "all">, string> = {
  queued: "border-[#d9d0a3] bg-[#faf7e8] text-[#7a6830]",
  sent: "border-[#c8dcbf] bg-[#eef8ea] text-[#2f6d44]",
  delivered: "border-[#bdd9ca] bg-[#e9f5ee] text-[#1f6a4d]",
  bounced: "border-[#e7c4c4] bg-[#fdf1f1] text-[#9d4a4a]",
  failed: "border-[#efc4c4] bg-[#fff3f3] text-status-error",
  skipped: "border-[#d7dde5] bg-[#f3f6f9] text-[#556372]",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "No se pudieron cargar los logs.";
}

export function EmailLogsAdminPanel() {
  const [statusFilter, setStatusFilter] = useState<EmailStatusFilter>("all");
  const [templateKey, setTemplateKey] = useState("");
  const [logs, setLogs] = useState<EmailLogRecord[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadLogs() {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

      if (statusFilter !== "all") params.set("status", statusFilter);
      if (templateKey) params.set("templateKey", templateKey);

      const response = await fetch(`/api/admin/email-logs?${params.toString()}`);
      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        data?: {
          items: EmailLogRecord[];
          total: number;
          page: number;
          pageSize: number;
          stats: Record<string, number>;
        };
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? "No se pudieron cargar los logs.");
      }

      setLogs(payload.data.items);
      setStats(payload.data.stats);
      setTotal(payload.data.total);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setLogs([]);
      setStats({});
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadLogs();
  }, [page, pageSize, statusFilter, templateKey]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <AdminBreadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Logs de correos" },
          ]}
        />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-section-md font-semibold text-text-primary">Logs de correos</h1>
            <p className="mt-1 text-body-sm text-text-secondary">
              Trazabilidad de envíos, errores y filtros por plantilla o estado durante los últimos 30 días.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as EmailStatusFilter);
                setPage(1);
              }}
              className={ADMIN_COMPACT_FIELD_CLASS_NAME}
            >
              <option value="all">Todos los estados</option>
              {EMAIL_STATUS_OPTIONS.filter((value) => value !== "all").map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>

            <select
              value={templateKey}
              onChange={(event) => {
                setTemplateKey(event.target.value);
                setPage(1);
              }}
              className={ADMIN_COMPACT_FIELD_CLASS_NAME}
            >
              {TEMPLATE_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button type="button" className={ADMIN_BUTTON_SECONDARY_CLASS_NAME} onClick={() => void loadLogs()}>
              Refrescar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {EMAIL_STATUS_OPTIONS.filter((value) => value !== "all").map((value) => (
          <div key={value} className={ADMIN_INSET_CARD_CLASS_NAME}>
            <p className="text-caption uppercase tracking-[0.12em] text-text-muted">{STATUS_LABELS[value]}</p>
            <p className="mt-2 text-section-sm font-semibold text-text-primary">{stats[value] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
        {error ? (
          <p className="rounded-2xl border border-status-error/20 bg-status-error/5 px-4 py-3 text-body-sm text-status-error">
            {error}
          </p>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d7e3d3] text-left">
            <thead>
              <tr className="text-label-sm text-text-secondary">
                <th className="px-3 py-3 font-medium">Fecha</th>
                <th className="px-3 py-3 font-medium">Destinatario</th>
                <th className="px-3 py-3 font-medium">Plantilla</th>
                <th className="px-3 py-3 font-medium">Estado</th>
                <th className="px-3 py-3 font-medium">Resend ID</th>
                <th className="px-3 py-3 font-medium">Asunto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2ebe0] text-body-sm text-text-primary">
              {isLoading ? (
                <tr>
                  <td className="px-3 py-10 text-center text-text-secondary" colSpan={6}>
                    Cargando logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td className="px-3 py-10 text-center text-text-secondary" colSpan={6}>
                    No hay envíos para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-3 py-4 align-top text-text-secondary">{formatDate(log.createdAt)}</td>
                    <td className="px-3 py-4 align-top">{log.recipient}</td>
                    <td className="px-3 py-4 align-top font-mono text-caption">{log.templateKey}</td>
                    <td className="px-3 py-4 align-top">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-caption ${STATUS_CLASS_NAMES[log.status]}`}>
                        {STATUS_LABELS[log.status]}
                      </span>
                    </td>
                    <td className="px-3 py-4 align-top font-mono text-caption text-text-secondary">
                      {log.resendId ?? "-"}
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="space-y-1">
                        <p>{log.subject}</p>
                        {log.errorMessage ? (
                          <p className="text-caption text-status-error">{log.errorMessage}</p>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#dfe9dc] pt-4 text-body-sm text-text-secondary">
          <p>
            Página {page} de {totalPages} · {total} registros
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
            >
              Anterior
            </button>
            <button
              type="button"
              className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}