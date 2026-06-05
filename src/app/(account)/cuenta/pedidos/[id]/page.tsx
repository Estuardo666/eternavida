"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  RotateCcw,
  Mail,
  Archive,
  ArchiveRestore,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { getProvinceNameById } from "@/config/ecuador-provinces";
import { useCart } from "@/features/cart/context/cart-context";

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
  cancelled: "border-[#efc4c4] bg-[#fff3f3] text-[#dc2626]",
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
  failed: "border-[#efc4c4] bg-[#fff3f3] text-[#dc2626]",
  refunded: "border-[#c8d7ef] bg-[#eef4fc] text-[#2d5fa7]",
  partially_refunded: "border-[#ead6bb] bg-[#fcf4ea] text-[#8b5a1e]",
};

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string | null;
  province: string;
  city: string;
  phone: string;
  idNumber: string | null;
  shippingMethodName: string;
  paymentMethodName: string;
  couponCode: string | null;
  subtotal: string;
  shippingCost: string;
  discountAmount: string;
  taxAmount: string;
  total: string;
  checkoutNotes: string | null;
  archived: boolean;
  billingFirstName: string | null;
  billingLastName: string | null;
  billingAddress: string | null;
  billingApartment: string | null;
  billingProvince: string | null;
  billingCity: string | null;
  billingPhone: string | null;
  billingRuc: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productId?: string | null;
    name: string;
    brand: string;
    price: string;
    discountPrice: string | null;
    quantity: number;
    imageUrl: string | null;
  }>;
}

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

const EASE = [0.25, 0.46, 0.45, 0.94] as const;
const CARD_CLASS = "rounded-xl border border-border-soft bg-surface-subtle p-5 sm:p-6";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<"idle" | "resending" | "archiving" | "reordering">("idle");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadOrder() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const payload = (await response.json()) as {
          success?: boolean;
          error?: string;
          data?: OrderDetail;
        };

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.error ?? "No se pudo cargar el pedido.");
        }

        if (!ignore) setOrder(payload.data);
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : "Error al cargar pedido.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadOrder();
    return () => { ignore = true; };
  }, [orderId]);

  async function handleResendEmail() {
    if (actionState !== "idle") return;
    setActionState("resending");
    setActionMessage(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend-confirmation" }),
      });
      const payload = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "No se pudo reenviar el correo.");
      }

      setActionMessage("Correo de confirmación reenviado correctamente.");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Error al reenviar correo.");
    } finally {
      setActionState("idle");
    }
  }

  async function handleArchive() {
    if (actionState !== "idle" || !order) return;
    setActionState("archiving");
    setActionMessage(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !order.archived }),
      });
      const payload = (await response.json()) as { success?: boolean; error?: string; data?: OrderDetail };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "No se pudo archivar el pedido.");
      }

      setOrder((prev) => prev ? { ...prev, archived: !prev.archived } : prev);
      setActionMessage(order.archived ? "Pedido desarchivado." : "Pedido archivado.");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Error al archivar pedido.");
    } finally {
      setActionState("idle");
    }
  }

  async function handleReorder() {
    if (actionState !== "idle" || !order) return;
    setActionState("reordering");

    try {
      for (const item of order.items) {
        for (let i = 0; i < item.quantity; i++) {
          addItem({
            id: item.productId ?? item.id,
            name: item.name,
            brand: item.brand,
            href: "#",
            price: Number(item.price),
            discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
            imageUrl: item.imageUrl,
            imageAlt: item.name,
          });
        }
      }
      router.push("/checkout");
    } catch {
      setActionState("idle");
      setActionMessage("Error al agregar productos al carrito.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Cuenta</p>
          <h1 className="text-headline-sm text-text-primary">Detalle del pedido</h1>
        </div>
        <div className={CARD_CLASS}>
          <div className="flex items-center justify-center py-14 text-body-sm text-text-secondary">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando pedido...
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Cuenta</p>
          <h1 className="text-headline-sm text-text-primary">Detalle del pedido</h1>
        </div>
        <div className={CARD_CLASS}>
          <div className="space-y-4 py-10 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-status-error" />
            <p className="text-body-sm text-status-error">{error ?? "Pedido no encontrado."}</p>
            <Link
              href="/cuenta/pedidos"
              className="inline-flex items-center gap-2 rounded-xl border border-border-soft bg-white px-5 py-3 text-label-md font-semibold text-text-primary transition-colors hover:border-border-brand"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Mis pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasBilling = Boolean(order.billingFirstName && order.billingAddress);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: EASE }}
        className="space-y-1"
      >
        <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Cuenta</p>
        <h1 className="text-headline-sm text-text-primary">Detalle del pedido</h1>
      </motion.div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: EASE, delay: 0.05 }}
      >
        <Link
          href="/cuenta/pedidos"
          className="inline-flex items-center gap-1.5 text-label-sm text-text-muted underline-offset-2 hover:text-text-secondary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Mis pedidos
        </Link>
      </motion.div>

      {/* Order header card */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: EASE, delay: 0.1 }}
        className={CARD_CLASS}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-body-lg font-semibold text-text-primary">{order.orderNumber}</h2>
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-caption ${STATUS_CLASS_NAMES[order.status] ?? ""}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-caption ${PAYMENT_STATUS_CLASS_NAMES[order.paymentStatus] ?? ""}`}>
                {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
              </span>
              {order.archived && (
                <span className="inline-flex rounded-full border border-gray-300 bg-gray-100 px-2.5 py-1 text-caption text-gray-600">
                  Archivado
                </span>
              )}
            </div>
            <p className="text-caption text-text-muted">
              <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
            </p>
          </div>
          <p className="text-headline-sm font-semibold text-text-primary">{formatCurrency(order.total)}</p>
        </div>

        {/* Tracking info */}
        {order.trackingNumber && (
          <div className="mt-4 rounded-lg border border-border-soft bg-white/70 px-4 py-3 text-body-sm">
            <span className="text-text-muted">Tracking: </span>
            {order.trackingUrl ? (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-text-brand underline-offset-2 hover:underline"
              >
                {order.trackingNumber}
              </a>
            ) : (
              <span className="font-medium text-text-primary">{order.trackingNumber}</span>
            )}
          </div>
        )}
      </motion.section>

      {/* Products */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: EASE, delay: 0.15 }}
        className={CARD_CLASS}
      >
        <div className="mb-4 flex items-center gap-2">
          <Package className="h-4 w-4 text-text-muted" />
          <h2 className="text-section-lg text-text-primary">Productos</h2>
        </div>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-lg border border-border-soft bg-white/70 p-3"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-caption text-text-muted">
                    N/A
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-medium text-text-primary">{item.name}</p>
                <p className="text-caption text-text-muted">{item.brand}</p>
                <p className="text-caption text-text-muted">Cantidad: {item.quantity}</p>
              </div>
              <div className="text-right">
                {item.discountPrice ? (
                  <>
                    <p className="text-body-sm font-medium text-text-primary">{formatCurrency(item.discountPrice)}</p>
                    <p className="text-caption text-text-muted line-through">{formatCurrency(item.price)}</p>
                  </>
                ) : (
                  <p className="text-body-sm font-medium text-text-primary">{formatCurrency(item.price)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Addresses row */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: EASE, delay: 0.2 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {/* Delivery address */}
        <section className={CARD_CLASS}>
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-text-muted" />
            <h2 className="text-section-lg text-text-primary">Dirección de entrega</h2>
          </div>
          <div className="space-y-1 text-body-sm text-text-secondary">
            <p className="font-medium text-text-primary">{order.firstName} {order.lastName}</p>
            <p>{order.address}</p>
            {order.apartment && <p>{order.apartment}</p>}
            <p>{order.city}, {getProvinceNameById(order.province) ?? order.province}</p>
            {order.phone && <p>Tel: {order.phone}</p>}
            {order.idNumber && <p>Cédula/RUC: {order.idNumber}</p>}
          </div>
        </section>

        {/* Billing address */}
        {hasBilling ? (
          <section className={CARD_CLASS}>
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-text-muted" />
              <h2 className="text-section-lg text-text-primary">Datos de facturación</h2>
            </div>
            <div className="space-y-1 text-body-sm text-text-secondary">
              <p className="font-medium text-text-primary">{order.billingFirstName} {order.billingLastName}</p>
              <p>{order.billingAddress}</p>
              {order.billingApartment && <p>{order.billingApartment}</p>}
              <p>{order.billingCity}, {getProvinceNameById(order.billingProvince ?? "") ?? order.billingProvince}</p>
              {order.billingPhone && <p>Tel: {order.billingPhone}</p>}
              {order.billingRuc && <p>RUC: {order.billingRuc}</p>}
            </div>
          </section>
        ) : null}
      </motion.div>

      {/* Payment & Shipping */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: EASE, delay: 0.25 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {/* Payment method */}
        <section className={CARD_CLASS}>
          <div className="mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-text-muted" />
            <h2 className="text-section-lg text-text-primary">Método de pago</h2>
          </div>
          <p className="text-body-sm font-medium text-text-primary">{order.paymentMethodName}</p>
        </section>

        {/* Shipping method */}
        <section className={CARD_CLASS}>
          <div className="mb-3 flex items-center gap-2">
            <Truck className="h-4 w-4 text-text-muted" />
            <h2 className="text-section-lg text-text-primary">Método de envío</h2>
          </div>
          <p className="text-body-sm font-medium text-text-primary">{order.shippingMethodName}</p>
        </section>
      </motion.div>

      {/* Order summary */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: EASE, delay: 0.3 }}
        className={CARD_CLASS}
      >
        <h2 className="mb-4 text-section-lg text-text-primary">Resumen de montos</h2>

        <div className="space-y-2.5 text-body-sm">
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Subtotal</span>
            <span className="font-medium text-text-primary">{formatCurrency(order.subtotal)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted">Envío</span>
            <span className="font-medium text-text-primary">
              {Number(order.shippingCost) === 0 ? (
                <span className="text-status-success">Gratis</span>
              ) : (
                formatCurrency(order.shippingCost)
              )}
            </span>
          </div>

          {Number(order.discountAmount) > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-text-muted">
                Descuento
                {order.couponCode && <span className="ml-1 text-caption">({order.couponCode})</span>}
              </span>
              <span className="font-medium text-status-success">-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}

          {Number(order.taxAmount) > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Impuestos</span>
              <span className="font-medium text-text-primary">{formatCurrency(order.taxAmount)}</span>
            </div>
          )}

          <div className="border-t border-border-soft pt-2.5">
            <div className="flex items-center justify-between">
              <span className="text-label-md font-semibold text-text-primary">Total</span>
              <span className="text-label-lg font-semibold text-text-primary">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {order.checkoutNotes && (
          <div className="mt-4 rounded-lg border border-border-soft bg-white/70 px-4 py-3">
            <p className="text-caption text-text-muted">Notas del pedido</p>
            <p className="mt-1 text-body-sm text-text-secondary">{order.checkoutNotes}</p>
          </div>
        )}
      </motion.section>

      {/* Actions */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: EASE, delay: 0.35 }}
        className={CARD_CLASS}
      >
        <h2 className="mb-4 text-section-lg text-text-primary">Acciones</h2>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReorder}
            disabled={actionState !== "idle"}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-label-md font-semibold text-white transition-colors hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {actionState === "reordering" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            {actionState === "reordering" ? "Agregando..." : "Recomprar"}
          </button>

          <button
            type="button"
            onClick={handleResendEmail}
            disabled={actionState !== "idle"}
            className="inline-flex items-center gap-2 rounded-xl border border-border-soft bg-white px-5 py-3 text-label-md font-medium text-text-primary transition-colors hover:border-border-brand hover:text-text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {actionState === "resending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {actionState === "resending" ? "Enviando..." : "Reenviar confirmación"}
          </button>

          <button
            type="button"
            onClick={handleArchive}
            disabled={actionState !== "idle"}
            className="inline-flex items-center gap-2 rounded-xl border border-border-soft bg-white px-5 py-3 text-label-md font-medium text-text-primary transition-colors hover:border-border-brand hover:text-text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {actionState === "archiving" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : order.archived ? (
              <ArchiveRestore className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            {order.archived ? "Desarchivar" : "Archivar pedido"}
          </button>

          <a
            href={`/api/orders/${order.id}/export-pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border-soft bg-white px-5 py-3 text-label-md font-medium text-text-primary transition-colors hover:border-border-brand hover:text-text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <FileText className="h-4 w-4" />
            Descargar PDF
          </a>
        </div>

        {actionMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-border-soft bg-white/70 px-4 py-3 text-body-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-status-success" />
            <span className="text-text-secondary">{actionMessage}</span>
          </div>
        )}
      </motion.section>
    </div>
  );
}
