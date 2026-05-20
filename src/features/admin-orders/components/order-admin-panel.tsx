"use client";

import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { ADMIN_COMPACT_FIELD_CLASS_NAME } from "@/components/admin/form-styles";
import {
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";
import { cx } from "@/lib/utils";

import { OrderDashboardStats } from "./order-dashboard-stats";
import { OrderDetailModal } from "./order-detail-modal";
import {
  ORDER_STATUS_CLASS_NAMES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_CLASS_NAMES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_OPTIONS,
  type AdminOrderRecord,
  type OrderDashboardStatsData,
  type OrderStatusValue,
  type PaymentStatusValue,
} from "./order-admin-types";

type FilterDraft = {
  search: string;
  status: OrderStatusValue | "all";
  paymentStatus: PaymentStatusValue | "all";
  shippingMethodName: string;
  paymentMethodName: string;
  dateFrom: string;
  dateTo: string;
  totalMin: string;
  totalMax: string;
  page: number;
  pageSize: number;
};

type OrderListResponse = {
  items: AdminOrderRecord[];
  total: number;
  page: number;
  pageSize: number;
};

function formatCurrency(value: string | number): string {
  const numericValue = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "No se pudo completar la operacion.";
}

function parseFilters(searchParams: URLSearchParams): FilterDraft {
  return {
    search: searchParams.get("search") ?? "",
    status: (searchParams.get("status") as OrderStatusValue | null) ?? "all",
    paymentStatus: (searchParams.get("paymentStatus") as PaymentStatusValue | null) ?? "all",
    shippingMethodName: searchParams.get("shippingMethodName") ?? "",
    paymentMethodName: searchParams.get("paymentMethodName") ?? "",
    dateFrom: searchParams.get("dateFrom") ?? "",
    dateTo: searchParams.get("dateTo") ?? "",
    totalMin: searchParams.get("totalMin") ?? "",
    totalMax: searchParams.get("totalMax") ?? "",
    page: Number(searchParams.get("page") ?? "1"),
    pageSize: Number(searchParams.get("pageSize") ?? "20"),
  };
}

function buildParams(filters: FilterDraft, options?: { orderIds?: string[] }) {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("pageSize", String(filters.pageSize));

  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.paymentStatus !== "all") params.set("paymentStatus", filters.paymentStatus);
  if (filters.shippingMethodName.trim()) params.set("shippingMethodName", filters.shippingMethodName.trim());
  if (filters.paymentMethodName.trim()) params.set("paymentMethodName", filters.paymentMethodName.trim());
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.totalMin.trim()) params.set("totalMin", filters.totalMin.trim());
  if (filters.totalMax.trim()) params.set("totalMax", filters.totalMax.trim());

  for (const orderId of options?.orderIds ?? []) {
    params.append("orderIds", orderId);
  }

  return params;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as { success?: boolean; error?: string; data?: T };

  if (!response.ok || !payload.success || payload.data == null) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload.data;
}

export function OrderAdminPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilters = parseFilters(searchParams);

  const [draftFilters, setDraftFilters] = useState<FilterDraft>(activeFilters);
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<OrderDashboardStatsData | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<OrderStatusValue>("pending");
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [rowStatusDrafts, setRowStatusDrafts] = useState<Record<string, OrderStatusValue>>({});

  useEffect(() => {
    setDraftFilters(activeFilters);
  }, [searchParams]);

  async function loadOrders() {
    setIsLoading(true);
    setListError(null);

    try {
      const response = await fetch(`/api/admin/orders?${buildParams(activeFilters).toString()}`);
      const data = await parseResponse<OrderListResponse>(response);
      setOrders(data.items);
      setTotal(data.total);
      setRowStatusDrafts(
        Object.fromEntries(data.items.map((order) => [order.id, order.status])) as Record<string, OrderStatusValue>,
      );
      setSelectedIds((current) => current.filter((id) => data.items.some((order) => order.id === id)));
    } catch (error) {
      setListError(getErrorMessage(error));
      setOrders([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDashboard() {
    setIsDashboardLoading(true);
    try {
      const response = await fetch("/api/admin/orders/dashboard");
      const data = await parseResponse<OrderDashboardStatsData>(response);
      setDashboardStats(data);
    } catch (error) {
      console.error("[orders-dashboard-load]", error);
      setDashboardStats(null);
    } finally {
      setIsDashboardLoading(false);
    }
  }

  async function loadOrderDetail(orderId: string) {
    setIsDetailLoading(true);
    setDetailError(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await parseResponse<AdminOrderRecord>(response);
      setSelectedOrder(data);
    } catch (error) {
      setDetailError(getErrorMessage(error));
      setSelectedOrder(null);
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function refreshSlice(orderId?: string | null) {
    await Promise.all([
      loadOrders(),
      loadDashboard(),
      orderId ? loadOrderDetail(orderId) : Promise.resolve(),
    ]);
  }

  useEffect(() => {
    void loadOrders();
    void loadDashboard();
  }, [searchParams]);

  useEffect(() => {
    if (!isDetailOpen || !selectedOrderId) return;
    void loadOrderDetail(selectedOrderId);
  }, [selectedOrderId, isDetailOpen]);

  function updateQuery(nextFilters: FilterDraft) {
    router.replace(`/admin/orders?${buildParams(nextFilters).toString()}`);
  }

  function applyFilters() {
    updateQuery({ ...draftFilters, page: 1 });
  }

  function clearFilters() {
    updateQuery({
      search: "",
      status: "all",
      paymentStatus: "all",
      shippingMethodName: "",
      paymentMethodName: "",
      dateFrom: "",
      dateTo: "",
      totalMin: "",
      totalMax: "",
      page: 1,
      pageSize: draftFilters.pageSize,
    });
  }

  async function handleQuickStatusSave(orderId: string) {
    const nextStatus = rowStatusDrafts[orderId];
    const order = orders.find((entry) => entry.id === orderId);
    if (!order || !nextStatus || nextStatus === order.status) return;

    setBulkActionLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const updated = await parseResponse<AdminOrderRecord>(response);
      setOrders((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      if (selectedOrderId === updated.id) setSelectedOrder(updated);
      await loadDashboard();
    } catch (error) {
      setListError(getErrorMessage(error));
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function handleBulkStatusUpdate() {
    if (selectedIds.length === 0) return;

    setBulkActionLoading(true);
    setListError(null);

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedIds, status: bulkStatus }),
      });
      await parseResponse<{ updated: number }>(response);
      await refreshSlice(selectedOrderId);
    } catch (error) {
      setListError(getErrorMessage(error));
    } finally {
      setBulkActionLoading(false);
    }
  }

  function handleExport(orderIds?: string[]) {
    const params = buildParams(
      { ...activeFilters, page: 1, pageSize: 100 },
      orderIds?.length ? { orderIds } : undefined,
    );
    window.open(`/api/admin/orders/export?${params.toString()}`, "_blank", "noopener,noreferrer");
  }

  const totalPages = Math.max(1, Math.ceil(total / activeFilters.pageSize));
  const shippingOptions = Array.from(new Set(orders.map((order) => order.shippingMethodName))).sort();
  const paymentOptions = Array.from(new Set(orders.map((order) => order.paymentMethodName))).sort();

  return (
    <div className="space-y-6">
      <div className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <AdminBreadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Pedidos" },
          ]}
        />

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-section-md font-semibold text-text-primary">Pedidos avanzados</h1>
            <p className="mt-1 max-w-3xl text-body-sm text-text-secondary">
              KPIs, filtros shareables, acciones masivas, timeline, notas, tracking, PDF y webhooks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={ADMIN_BUTTON_SECONDARY_CLASS_NAME} onClick={() => handleExport()}>
              Exportar CSV
            </button>
            <button type="button" className={ADMIN_BUTTON_SECONDARY_CLASS_NAME} onClick={() => void refreshSlice(selectedOrderId)}>
              Refrescar
            </button>
          </div>
        </div>
      </div>

      <section className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "space-y-4")}> 
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input
            value={draftFilters.search}
            onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
            className={ADMIN_COMPACT_FIELD_CLASS_NAME}
            placeholder="Buscar por pedido, cliente, email o telefono"
          />

          <select
            value={draftFilters.status}
            onChange={(event) =>
              setDraftFilters((current) => ({
                ...current,
                status: event.target.value as OrderStatusValue | "all",
              }))
            }
            className={ADMIN_COMPACT_FIELD_CLASS_NAME}
          >
            <option value="all">Todos los estados</option>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          <select
            value={draftFilters.paymentStatus}
            onChange={(event) =>
              setDraftFilters((current) => ({
                ...current,
                paymentStatus: event.target.value as PaymentStatusValue | "all",
              }))
            }
            className={ADMIN_COMPACT_FIELD_CLASS_NAME}
          >
            <option value="all">Todos los pagos</option>
            {PAYMENT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {PAYMENT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          <select
            value={draftFilters.shippingMethodName}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, shippingMethodName: event.target.value }))
            }
            className={ADMIN_COMPACT_FIELD_CLASS_NAME}
          >
            <option value="">Todos los envios</option>
            {shippingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={draftFilters.paymentMethodName}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, paymentMethodName: event.target.value }))
            }
            className={ADMIN_COMPACT_FIELD_CLASS_NAME}
          >
            <option value="">Todos los metodos de pago</option>
            {paymentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={draftFilters.dateFrom}
            onChange={(event) => setDraftFilters((current) => ({ ...current, dateFrom: event.target.value }))}
            className={ADMIN_COMPACT_FIELD_CLASS_NAME}
          />
          <input
            type="date"
            value={draftFilters.dateTo}
            onChange={(event) => setDraftFilters((current) => ({ ...current, dateTo: event.target.value }))}
            className={ADMIN_COMPACT_FIELD_CLASS_NAME}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={draftFilters.totalMin}
              onChange={(event) => setDraftFilters((current) => ({ ...current, totalMin: event.target.value }))}
              className={ADMIN_COMPACT_FIELD_CLASS_NAME}
              placeholder="Total minimo"
              inputMode="decimal"
            />
            <input
              value={draftFilters.totalMax}
              onChange={(event) => setDraftFilters((current) => ({ ...current, totalMax: event.target.value }))}
              className={ADMIN_COMPACT_FIELD_CLASS_NAME}
              placeholder="Total maximo"
              inputMode="decimal"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={ADMIN_BUTTON_PRIMARY_CLASS_NAME} onClick={applyFilters}>
            Aplicar filtros
          </button>
          <button type="button" className={ADMIN_BUTTON_SECONDARY_CLASS_NAME} onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      </section>

      {selectedIds.length > 0 ? (
        <section className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "flex flex-wrap items-center justify-between gap-3")}> 
          <p className="text-body-sm text-text-secondary">{selectedIds.length} pedidos seleccionados</p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(event) => setBulkStatus(event.target.value as OrderStatusValue)}
              className={ADMIN_COMPACT_FIELD_CLASS_NAME}
            >
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}
              onClick={() => void handleBulkStatusUpdate()}
              disabled={bulkActionLoading}
            >
              Cambiar estado
            </button>
            <button
              type="button"
              className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
              onClick={() => handleExport(selectedIds)}
            >
              Exportar seleccionados
            </button>
          </div>
        </section>
      ) : null}

      <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
        {listError ? (
          <p className="mb-4 rounded-2xl border border-status-error/20 bg-status-error/5 px-4 py-3 text-body-sm text-status-error">
            {listError}
          </p>
        ) : null}

        {detailError ? (
          <p className="mb-4 rounded-2xl border border-status-error/20 bg-status-error/5 px-4 py-3 text-body-sm text-status-error">
            {detailError}
          </p>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-[#c8d9c4] p-8 text-center text-text-secondary">
            Cargando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#c8d9c4] p-8 text-center text-text-secondary">
            No hay pedidos para los filtros seleccionados.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full border-separate border-spacing-0 text-left text-body-sm">
                <thead>
                  <tr className="sticky top-0 bg-[rgba(247,250,246,0.97)] text-text-secondary">
                    <th className="border-b border-[#d8e3d4] px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === orders.length}
                        onChange={(event) =>
                          setSelectedIds(event.target.checked ? orders.map((order) => order.id) : [])
                        }
                      />
                    </th>
                    <th className="border-b border-[#d8e3d4] px-3 py-3">Pedido</th>
                    <th className="border-b border-[#d8e3d4] px-3 py-3">Fecha</th>
                    <th className="border-b border-[#d8e3d4] px-3 py-3">Cliente</th>
                    <th className="border-b border-[#d8e3d4] px-3 py-3 text-right">Total</th>
                    <th className="border-b border-[#d8e3d4] px-3 py-3">Estado</th>
                    <th className="border-b border-[#d8e3d4] px-3 py-3">Pago</th>
                    <th className="border-b border-[#d8e3d4] px-3 py-3">Envio</th>
                    <th className="border-b border-[#d8e3d4] px-3 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-[#edf2eb] align-top">
                      <td className="border-b border-[#edf2eb] px-3 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(order.id)}
                          onChange={(event) =>
                            setSelectedIds((current) =>
                              event.target.checked
                                ? [...current, order.id]
                                : current.filter((id) => id !== order.id),
                            )
                          }
                        />
                      </td>
                      <td className="border-b border-[#edf2eb] px-3 py-4">
                        <p className="font-semibold text-text-primary">{order.orderNumber}</p>
                        <p className="mt-1 text-caption text-text-muted">{order.items.length} items</p>
                      </td>
                      <td className="border-b border-[#edf2eb] px-3 py-4 text-text-secondary">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="border-b border-[#edf2eb] px-3 py-4">
                        <p className="text-text-primary">{order.firstName} {order.lastName}</p>
                        <p className="mt-1 text-caption text-text-muted">{order.guestEmail ?? order.phone}</p>
                      </td>
                      <td className="border-b border-[#edf2eb] px-3 py-4 text-right font-semibold text-text-primary">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="border-b border-[#edf2eb] px-3 py-4">
                        <span className={cx("inline-flex rounded-full border px-2.5 py-1 text-caption", ORDER_STATUS_CLASS_NAMES[order.status])}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="border-b border-[#edf2eb] px-3 py-4">
                        <span className={cx("inline-flex rounded-full border px-2.5 py-1 text-caption", PAYMENT_STATUS_CLASS_NAMES[order.paymentStatus])}>
                          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                        </span>
                      </td>
                      <td className="border-b border-[#edf2eb] px-3 py-4 text-text-secondary">
                        <p>{order.shippingMethodName}</p>
                        <p className="mt-1 text-caption text-text-muted">{order.trackingNumber ?? "Sin tracking"}</p>
                      </td>
                      <td className="border-b border-[#edf2eb] px-3 py-4">
                        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
                          <select
                            value={rowStatusDrafts[order.id] ?? order.status}
                            onChange={(event) =>
                              setRowStatusDrafts((current) => ({
                                ...current,
                                [order.id]: event.target.value as OrderStatusValue,
                              }))
                            }
                            className={cx(ADMIN_COMPACT_FIELD_CLASS_NAME, "!w-[118px] shrink-0 px-2")}
                          >
                            {ORDER_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {ORDER_STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className={cx(ADMIN_BUTTON_SECONDARY_CLASS_NAME, "shrink-0")}
                            onClick={() => void handleQuickStatusSave(order.id)}
                            disabled={bulkActionLoading}
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            className={cx(ADMIN_BUTTON_SECONDARY_CLASS_NAME, "shrink-0")}
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setIsDetailOpen(true);
                            }}
                          >
                            Ver detalle
                          </button>
                          <button
                            type="button"
                            className={cx(ADMIN_BUTTON_SECONDARY_CLASS_NAME, "shrink-0")}
                            onClick={() =>
                              window.open(`/api/admin/orders/${order.id}/export-pdf`, "_blank", "noopener,noreferrer")
                            }
                          >
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {orders.map((order) => (
                <article key={order.id} className="rounded-2xl border border-[#d8e3d4] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(order.id)}
                          onChange={(event) =>
                            setSelectedIds((current) =>
                              event.target.checked
                                ? [...current, order.id]
                                : current.filter((id) => id !== order.id),
                            )
                          }
                        />
                        <h2 className="text-body-lg font-semibold text-text-primary">{order.orderNumber}</h2>
                      </div>
                      <p className="mt-1 text-body-sm text-text-secondary">
                        {order.firstName} {order.lastName}
                      </p>
                      <p className="mt-1 text-caption text-text-muted">{formatDate(order.createdAt)}</p>
                    </div>
                    <p className="text-body-lg font-semibold text-text-primary">{formatCurrency(order.total)}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={cx("inline-flex rounded-full border px-2.5 py-1 text-caption", ORDER_STATUS_CLASS_NAMES[order.status])}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className={cx("inline-flex rounded-full border px-2.5 py-1 text-caption", PAYMENT_STATUS_CLASS_NAMES[order.paymentStatus])}>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
                    <button
                      type="button"
                      className={cx(ADMIN_BUTTON_SECONDARY_CLASS_NAME, "shrink-0")}
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setIsDetailOpen(true);
                      }}
                    >
                      Ver detalle
                    </button>
                    <button
                      type="button"
                      className={cx(ADMIN_BUTTON_SECONDARY_CLASS_NAME, "shrink-0")}
                      onClick={() =>
                        window.open(`/api/admin/orders/${order.id}/export-pdf`, "_blank", "noopener,noreferrer")
                      }
                    >
                      PDF
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#dfe9dc] pt-4 text-body-sm text-text-secondary">
          <p>
            Pagina {activeFilters.page} de {totalPages} · {total} pedidos
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
              onClick={() => updateQuery({ ...activeFilters, page: Math.max(1, activeFilters.page - 1) })}
              disabled={activeFilters.page <= 1}
            >
              Anterior
            </button>
            <button
              type="button"
              className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
              onClick={() => updateQuery({ ...activeFilters, page: Math.min(totalPages, activeFilters.page + 1) })}
              disabled={activeFilters.page >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      <OrderDashboardStats stats={dashboardStats} isLoading={isDashboardLoading} />

      <OrderDetailModal
        isOpen={isDetailOpen}
        order={selectedOrder}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
        onOrderUpdated={(order) => {
          setSelectedOrder(order);
          setOrders((current) => current.map((entry) => (entry.id === order.id ? order : entry)));
          void loadDashboard();
        }}
      />

      {isDetailOpen && isDetailLoading ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#0d1611]/20 text-body-sm text-text-primary">
          Cargando detalle...
        </div>
      ) : null}
    </div>
  );
}