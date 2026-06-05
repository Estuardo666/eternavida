"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Archive, RotateCcw } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  processing: "En proceso",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

const STATUS_CLASS_NAMES: Record<string, string> = {
  pending: "border-[#d9d0a3] bg-[#faf7e8] text-[#7a6830]",
  confirmed: "border-[#c8dcbf] bg-[#eef8ea] text-[#2f6d44]",
  processing: "border-[#ead6bb] bg-[#fcf4ea] text-[#8b5a1e]",
  shipped: "border-[#c8d7ef] bg-[#eef4fc] text-[#2d5fa7]",
  delivered: "border-[#bdd9ca] bg-[#e9f5ee] text-[#1f6a4d]",
  cancelled: "border-[#efc4c4] bg-[#fff3f3] text-status-error",
  refunded: "border-[#d8cdee] bg-[#f7f2fd] text-[#6f46b6]",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  failed: "Fallido",
  refunded: "Reembolsado",
  partially_refunded: "Reembolso parcial",
};

const PAYMENT_STATUS_CLASS_NAMES: Record<string, string> = {
  pending: "border-[#d9d0a3] bg-[#faf7e8] text-[#7a6830]",
  paid: "border-[#c8dcbf] bg-[#eef8ea] text-[#2f6d44]",
  failed: "border-[#efc4c4] bg-[#fff3f3] text-status-error",
  refunded: "border-[#c8d7ef] bg-[#eef4fc] text-[#2d5fa7]",
  partially_refunded: "border-[#ead6bb] bg-[#fcf4ea] text-[#8b5a1e]",
};

type UserOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  paymentMethodName: string;
  createdAt: string;
  archived: boolean;
  items: Array<{
    id: string;
    name: string;
    brand: string;
    price: string;
    quantity: number;
  }>;
};

function formatCurrency(value: string): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function CuentaPedidosPage() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      setIsLoading(true);
      setError(null);

      try {
        const archivedParam = activeTab === "archived" ? "true" : "false";
        const response = await fetch(`/api/orders?page=1&pageSize=50&archived=${archivedParam}`);
        const payload = (await response.json()) as {
          success?: boolean;
          error?: string;
          data?: { items: UserOrder[] };
        };

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.error ?? "No se pudieron cargar tus pedidos.");
        }

        if (!ignore) setOrders(payload.data.items);
      } catch (loadError) {
        if (!ignore) {
          setOrders([]);
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar tus pedidos.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadOrders();

    return () => {
      ignore = true;
    };
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="space-y-1"
      >
        <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Cuenta</p>
        <h1 className="text-headline-sm text-text-primary">Mis pedidos</h1>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.05 }}
        className="flex gap-1 rounded-lg border border-border-soft bg-surface-subtle p-1"
      >
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-label-sm font-medium transition-colors ${
            activeTab === "active"
              ? "bg-white text-text-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          <Package className="h-4 w-4" />
          Activos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("archived")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-label-sm font-medium transition-colors ${
            activeTab === "archived"
              ? "bg-white text-text-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          <Archive className="h-4 w-4" />
          Archivados
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.12 }}
        className="rounded-xl border border-border-soft bg-surface-subtle p-5 sm:p-8"
      >
        {isLoading ? (
          <div className="py-14 text-center text-body-sm text-text-secondary">Cargando pedidos...</div>
        ) : error ? (
          <div className="space-y-4 py-10 text-center">
            <p className="text-body-sm text-status-error">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl border border-border-soft bg-white px-5 py-3 text-label-md font-semibold text-text-primary transition-colors hover:border-border-brand hover:text-text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              Reintentar
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 py-14 text-center">
            {activeTab === "archived" ? (
              <Archive className="h-16 w-16 text-text-muted opacity-40" />
            ) : (
              <ShoppingBagEmptyIcon />
            )}
            <div className="space-y-1.5">
              <h2 className="text-section-lg text-text-primary">
                {activeTab === "archived" ? "No tienes pedidos archivados" : "Aún no tienes pedidos"}
              </h2>
              <p className="text-body-sm text-text-secondary">
                {activeTab === "archived"
                  ? "Los pedidos archivados aparecerán aquí."
                  : "Tus pedidos aparecerán aquí una vez que completes tu primera compra."}
              </p>
            </div>
            {activeTab !== "archived" && (
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-label-md font-semibold text-white transition-colors hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                Explorar productos
              </Link>
            )}
            {activeTab === "archived" && (
              <button
                type="button"
                onClick={() => setActiveTab("active")}
                className="inline-flex items-center gap-2 rounded-xl border border-border-soft bg-white px-5 py-3 text-label-md font-semibold text-text-primary transition-colors hover:border-border-brand"
              >
                <RotateCcw className="h-4 w-4" />
                Ver pedidos activos
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-border-soft bg-white/80 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-body-lg font-semibold text-text-primary">{order.orderNumber}</h2>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-caption ${STATUS_CLASS_NAMES[order.status] ?? ""}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-caption ${PAYMENT_STATUS_CLASS_NAMES[order.paymentStatus] ?? ""}`}>
                        {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-caption text-text-muted">{formatDate(order.createdAt)}</p>
                  </div>
                  <p className="text-body-lg font-semibold text-text-primary">{formatCurrency(order.total)}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border-soft pt-4 text-body-sm text-text-secondary">
                  <div className="space-y-1">
                    <p>
                      Metodo de pago: <span className="font-medium text-text-primary">{order.paymentMethodName}</span>
                    </p>
                    {order.trackingNumber ? (
                      <p>
                        Tracking: {order.trackingUrl ? (
                          <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="font-medium text-text-brand underline-offset-2 hover:underline">
                            {order.trackingNumber}
                          </a>
                        ) : (
                          <span className="font-medium text-text-primary">{order.trackingNumber}</span>
                        )}
                      </p>
                    ) : (
                      <p>Tracking: aun no disponible</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/cuenta/pedidos/${order.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-border-soft bg-white px-4 py-2 text-label-sm font-semibold text-text-primary transition-colors hover:border-border-brand hover:text-text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                    >
                      Ver pedido
                    </Link>
                    <button
                      type="button"
                      onClick={() => window.open(`/api/orders/${order.id}/export-pdf`, "_blank", "noopener,noreferrer")}
                      className="inline-flex items-center gap-2 rounded-xl border border-border-soft bg-white px-4 py-2 text-label-sm font-semibold text-text-primary transition-colors hover:border-border-brand hover:text-text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                    >
                      Descargar PDF
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ShoppingBagEmptyIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      className="h-20 w-20 text-text-muted opacity-40"
    >
      <rect x="14" y="26" width="52" height="42" rx="6" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M28 26C28 18.268 33.373 12 40 12C46.627 12 52 18.268 52 26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M28 38h24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
