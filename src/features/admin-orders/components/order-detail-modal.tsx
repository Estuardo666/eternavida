"use client";

import { useEffect, useState } from "react";

import {
  ADMIN_COMPACT_FIELD_CLASS_NAME,
  ADMIN_COMPACT_PROMINENT_FIELD_CLASS_NAME,
} from "@/components/admin/form-styles";
import {
  ADMIN_BUTTON_NEUTRAL_SMALL_CLASS_NAME,
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_INSET_CARD_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { cx } from "@/lib/utils";

import {
  ORDER_STATUS_CLASS_NAMES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_CLASS_NAMES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_OPTIONS,
  type AdminOrderRecord,
  type OrderItemRecord,
  type OrderNoteVisibilityValue,
  type PaymentStatusValue,
  type OrderStatusValue,
} from "./order-admin-types";

const ORDER_FLOW: ReadonlyArray<OrderStatusValue> = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(typeof value === "number" ? value : Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "No se pudo completar la operacion.";
}

type EditableItem = {
  id: string;
  name: string;
  brand: string;
  price: string;
  quantity: number;
  imageUrl?: string | null;
  productId?: string | null;
};

function toEditableItems(items: OrderItemRecord[]): EditableItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    brand: item.brand,
    price: item.discountPrice ?? item.price,
    quantity: item.quantity,
    imageUrl: item.imageUrl,
    productId: item.productId,
  }));
}

type AddressFormState = {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  province: string;
  city: string;
  phone: string;
  idNumber: string;
};

const ADDRESS_FIELDS: ReadonlyArray<{
  key: keyof AddressFormState;
  label: string;
}> = [
  { key: "firstName", label: "Nombre" },
  { key: "lastName", label: "Apellido" },
  { key: "address", label: "Direccion" },
  { key: "apartment", label: "Apartamento" },
  { key: "province", label: "Provincia" },
  { key: "city", label: "Ciudad" },
  { key: "phone", label: "Telefono" },
  { key: "idNumber", label: "Cedula" },
] as const;

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as { success?: boolean; error?: string; data?: T };
  if (!response.ok || !payload.success || payload.data == null) {
    throw new Error(payload.error ?? "Request failed.");
  }
  return payload.data;
}

export interface OrderDetailModalProps {
  isOpen: boolean;
  order: AdminOrderRecord | null;
  onClose: () => void;
  onOrderUpdated: (order: AdminOrderRecord) => void;
}

export function OrderDetailModal(props: OrderDetailModalProps) {
  const { isOpen, order, onClose, onOrderUpdated } = props;
  const [localOrder, setLocalOrder] = useState<AdminOrderRecord | null>(order);
  const [statusValue, setStatusValue] = useState<OrderStatusValue>(order?.status ?? "pending");
  const [paymentStatusValue, setPaymentStatusValue] = useState<PaymentStatusValue>(
    order?.paymentStatus ?? "pending",
  );
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber ?? "");
  const [trackingUrl, setTrackingUrl] = useState(order?.trackingUrl ?? "");
  const [discountAmount, setDiscountAmount] = useState(order?.discountAmount ?? "0");
  const [noteContent, setNoteContent] = useState("");
  const [noteVisibility, setNoteVisibility] = useState<OrderNoteVisibilityValue>("internal");
  const [addressForm, setAddressForm] = useState<AddressFormState>({
    firstName: order?.firstName ?? "",
    lastName: order?.lastName ?? "",
    address: order?.address ?? "",
    apartment: order?.apartment ?? "",
    province: order?.province ?? "",
    city: order?.city ?? "",
    phone: order?.phone ?? "",
    idNumber: order?.idNumber ?? "",
  });
  const [draftItems, setDraftItems] = useState<EditableItem[]>(order ? toEditableItems(order.items) : []);
  const [isEditingItems, setIsEditingItems] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalOrder(order);
    setStatusValue(order?.status ?? "pending");
    setPaymentStatusValue(order?.paymentStatus ?? "pending");
    setTrackingNumber(order?.trackingNumber ?? "");
    setTrackingUrl(order?.trackingUrl ?? "");
    setDiscountAmount(order?.discountAmount ?? "0");
    setNoteContent("");
    setNoteVisibility("internal");
    setAddressForm({
      firstName: order?.firstName ?? "",
      lastName: order?.lastName ?? "",
      address: order?.address ?? "",
      apartment: order?.apartment ?? "",
      province: order?.province ?? "",
      city: order?.city ?? "",
      phone: order?.phone ?? "",
      idNumber: order?.idNumber ?? "",
    });
    setDraftItems(order ? toEditableItems(order.items) : []);
    setIsEditingItems(false);
    setError(null);
  }, [order]);

  if (!isOpen || !localOrder) return null;

  async function runMutation(actionKey: string, request: () => Promise<AdminOrderRecord>) {
    setPendingAction(actionKey);
    setError(null);

    try {
      const updatedOrder = await request();
      setLocalOrder(updatedOrder);
      onOrderUpdated(updatedOrder);
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleStatusSave() {
    if (!localOrder || statusValue === localOrder.status) return;

    await runMutation("status", async () => {
      const response = await fetch(`/api/admin/orders/${localOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusValue }),
      });
      return parseResponse<AdminOrderRecord>(response);
    });
  }

  async function handlePaymentStatusSave() {
    if (!localOrder || paymentStatusValue === localOrder.paymentStatus) return;

    await runMutation("payment-status", async () => {
      const response = await fetch(`/api/admin/orders/${localOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: paymentStatusValue }),
      });
      return parseResponse<AdminOrderRecord>(response);
    });
  }

  async function handleTrackingSave() {
    if (!localOrder) return;

    await runMutation("tracking", async () => {
      const response = await fetch(`/api/admin/orders/${localOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNumber,
          trackingUrl,
        }),
      });
      return parseResponse<AdminOrderRecord>(response);
    });
  }

  async function handleAddressSave() {
    if (!localOrder) return;

    await runMutation("address", async () => {
      const response = await fetch(`/api/admin/orders/${localOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addressForm }),
      });
      return parseResponse<AdminOrderRecord>(response);
    });
  }

  async function handleDiscountSave() {
    if (!localOrder) return;

    await runMutation("discount", async () => {
      const response = await fetch(`/api/admin/orders/${localOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountAmount }),
      });
      return parseResponse<AdminOrderRecord>(response);
    });
  }

  async function handleItemsSave() {
    if (!localOrder) return;

    await runMutation("items", async () => {
      const response = await fetch(`/api/admin/orders/${localOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: draftItems.map((item) => ({
            productId: item.productId ?? undefined,
            name: item.name,
            brand: item.brand,
            price: item.price,
            quantity: Number(item.quantity),
            imageUrl: item.imageUrl ?? undefined,
          })),
        }),
      });
      return parseResponse<AdminOrderRecord>(response);
    });

    setIsEditingItems(false);
  }

  async function handleAddNote() {
    if (!localOrder || noteContent.trim().length === 0) return;

    await runMutation("note", async () => {
      const response = await fetch(`/api/admin/orders/${localOrder.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: noteContent,
          visibility: noteVisibility,
        }),
      });
      return parseResponse<AdminOrderRecord>(response);
    });

    setNoteContent("");
  }

  async function handleResendEmail(templateKey: "order_confirmation" | "order_status_update") {
    if (!localOrder) return;

    await runMutation(`resend-${templateKey}`, async () => {
      const response = await fetch(`/api/admin/orders/${localOrder.id}/resend-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateKey }),
      });
      return parseResponse<AdminOrderRecord>(response);
    });
  }

  function handleDownloadPdf() {
    if (!localOrder) return;
    window.open(`/api/admin/orders/${localOrder.id}/export-pdf`, "_blank", "noopener,noreferrer");
  }

  function updateDraftItem(id: string, field: keyof EditableItem, value: string | number) {
    setDraftItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function removeDraftItem(id: string) {
    setDraftItems((current) => current.filter((item) => item.id !== id));
  }

  function addDraftItem() {
    setDraftItems((current) => [
      ...current,
      {
        id: `new-${Date.now()}`,
        name: "",
        brand: "",
        price: "0",
        quantity: 1,
      },
    ]);
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1611]/45 p-3 sm:p-5">
      <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#d8e3d4] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(247,250,246,0.99))]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#d8e3d4] px-5 py-4 sm:px-7">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-section-md font-semibold text-text-primary">{localOrder.orderNumber}</h2>
              <span className={cx("inline-flex rounded-full border px-2.5 py-1 text-caption", ORDER_STATUS_CLASS_NAMES[localOrder.status])}>
                {ORDER_STATUS_LABELS[localOrder.status]}
              </span>
              <span className={cx("inline-flex rounded-full border px-2.5 py-1 text-caption", PAYMENT_STATUS_CLASS_NAMES[localOrder.paymentStatus])}>
                Pago: {PAYMENT_STATUS_LABELS[localOrder.paymentStatus]}
              </span>
            </div>
            <p className="mt-1 text-body-sm text-text-secondary">
              {localOrder.firstName} {localOrder.lastName} · {formatDate(localOrder.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={ADMIN_BUTTON_SECONDARY_CLASS_NAME} onClick={handleDownloadPdf}>
              Descargar PDF
            </button>
            <button
              type="button"
              className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
              onClick={() => void handleResendEmail("order_confirmation")}
              disabled={pendingAction === "resend-order_confirmation"}
            >
              Reenviar confirmacion
            </button>
            <button
              type="button"
              className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
              onClick={() => void handleResendEmail("order_status_update")}
              disabled={pendingAction === "resend-order_status_update"}
            >
              Reenviar estado
            </button>
            <button type="button" className={ADMIN_BUTTON_PRIMARY_CLASS_NAME} onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {error ? (
            <div className="mb-4 rounded-2xl border border-status-error/20 bg-status-error/5 px-4 py-3 text-body-sm text-status-error">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,0.95fr)]">
            <div className="space-y-4">
              <section className={ADMIN_INSET_CARD_CLASS_NAME}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-label-md font-semibold text-text-primary">Actividad</h3>
                    <p className="mt-1 text-body-sm text-text-secondary">Timeline del pedido</p>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {localOrder.timeline.length === 0 ? (
                    <p className="text-body-sm text-text-secondary">Aun no hay actividad registrada.</p>
                  ) : (
                    localOrder.timeline.map((entry) => (
                      <div key={entry.id} className="relative pl-5">
                        <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-[#72B255]" />
                        <div className="space-y-1 border-l border-[#d8e3d4] pl-4">
                          <p className="text-body-sm font-medium text-text-primary">{entry.description}</p>
                          <p className="text-caption text-text-muted">
                            {formatDate(entry.createdAt)} · {entry.createdBy ?? "system"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className={ADMIN_INSET_CARD_CLASS_NAME}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-label-md font-semibold text-text-primary">Productos</h3>
                    <p className="mt-1 text-body-sm text-text-secondary">Edicion inline del pedido</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
                      onClick={() => setIsEditingItems((current) => !current)}
                    >
                      {isEditingItems ? "Cancelar edicion" : "Editar items"}
                    </button>
                    {isEditingItems ? (
                      <button
                        type="button"
                        className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}
                        onClick={() => void handleItemsSave()}
                        disabled={pendingAction === "items"}
                      >
                        {pendingAction === "items" ? "Guardando..." : "Guardar items"}
                      </button>
                    ) : null}
                  </div>
                </div>

                {isEditingItems ? (
                  <div className="mt-4 space-y-3">
                    {draftItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-1 gap-3 rounded-2xl border border-[#d8e3d4] p-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_120px_100px_auto]">
                        <input
                          value={item.name}
                          onChange={(event) => updateDraftItem(item.id, "name", event.target.value)}
                          className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                          placeholder="Producto"
                        />
                        <input
                          value={item.brand}
                          onChange={(event) => updateDraftItem(item.id, "brand", event.target.value)}
                          className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                          placeholder="Marca"
                        />
                        <input
                          value={item.price}
                          onChange={(event) => updateDraftItem(item.id, "price", event.target.value)}
                          className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                          placeholder="Precio"
                          inputMode="decimal"
                        />
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) => updateDraftItem(item.id, "quantity", Number(event.target.value))}
                          className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                        />
                        <button
                          type="button"
                          className={ADMIN_BUTTON_NEUTRAL_SMALL_CLASS_NAME}
                          onClick={() => removeDraftItem(item.id)}
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                    <button type="button" className={ADMIN_BUTTON_SECONDARY_CLASS_NAME} onClick={addDraftItem}>
                      Agregar producto
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-body-sm">
                      <thead className="text-text-secondary">
                        <tr>
                          <th className="pb-2">Producto</th>
                          <th className="pb-2">Marca</th>
                          <th className="pb-2 text-right">Precio</th>
                          <th className="pb-2 text-right">Cant.</th>
                          <th className="pb-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {localOrder.items.map((item) => {
                          const unitPrice = item.discountPrice ?? item.price;
                          return (
                            <tr key={item.id} className="border-t border-[#e6eee4] text-text-primary">
                              <td className="py-3">{item.name}</td>
                              <td className="py-3 text-text-secondary">{item.brand}</td>
                              <td className="py-3 text-right">{formatCurrency(unitPrice)}</td>
                              <td className="py-3 text-right">{item.quantity}</td>
                              <td className="py-3 text-right">{formatCurrency(Number(unitPrice) * item.quantity)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className={ADMIN_INSET_CARD_CLASS_NAME}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-label-md font-semibold text-text-primary">Totales</h3>
                    <p className="mt-1 text-body-sm text-text-secondary">Descuento manual editable</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={discountAmount}
                      onChange={(event) => setDiscountAmount(event.target.value)}
                      className={cx(ADMIN_COMPACT_PROMINENT_FIELD_CLASS_NAME, "w-[160px]")}
                      inputMode="decimal"
                    />
                    <button
                      type="button"
                      className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}
                      onClick={() => void handleDiscountSave()}
                      disabled={pendingAction === "discount"}
                    >
                      Aplicar descuento
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { label: "Subtotal", value: localOrder.subtotal },
                    { label: "Envio", value: localOrder.shippingCost },
                    { label: "Descuento", value: localOrder.discountAmount },
                    { label: "Impuestos", value: localOrder.taxAmount },
                    { label: "Total", value: localOrder.total },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-2xl border border-[#d8e3d4] px-4 py-3">
                      <p className="text-caption uppercase tracking-[0.12em] text-text-muted">{label}</p>
                      <p className="mt-2 text-body-lg font-semibold text-text-primary">{formatCurrency(value)}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className={ADMIN_INSET_CARD_CLASS_NAME}>
                <div>
                  <h3 className="text-label-md font-semibold text-text-primary">Notas</h3>
                  <p className="mt-1 text-body-sm text-text-secondary">Notas internas y visibles para cliente</p>
                </div>
                <div className="mt-4 space-y-3">
                  {localOrder.notes.length === 0 ? (
                    <p className="text-body-sm text-text-secondary">No hay notas registradas.</p>
                  ) : (
                    localOrder.notes.map((note) => (
                      <div key={note.id} className="rounded-2xl border border-[#d8e3d4] px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cx(
                            "inline-flex rounded-full border px-2.5 py-1 text-caption",
                            note.visibility === "customer"
                              ? "border-[#c8dcbf] bg-[#eef8ea] text-[#2f6d44]"
                              : "border-[#c8d7ef] bg-[#eef4fc] text-[#2d5fa7]",
                          )}>
                            {note.visibility === "customer" ? "Cliente" : "Interna"}
                          </span>
                          <span className="text-caption text-text-muted">
                            {formatDate(note.createdAt)} · {note.createdBy ?? "system"}
                          </span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-body-sm text-text-primary">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
                  <textarea
                    value={noteContent}
                    onChange={(event) => setNoteContent(event.target.value)}
                    className={cx(ADMIN_COMPACT_FIELD_CLASS_NAME, "min-h-[110px] resize-y")}
                    placeholder="Agregar una nota"
                  />
                  <select
                    value={noteVisibility}
                    onChange={(event) => setNoteVisibility(event.target.value as OrderNoteVisibilityValue)}
                    className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                  >
                    <option value="internal">Interna</option>
                    <option value="customer">Visible para cliente</option>
                  </select>
                  <button
                    type="button"
                    className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}
                    onClick={() => void handleAddNote()}
                    disabled={pendingAction === "note"}
                  >
                    Agregar nota
                  </button>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <section className={ADMIN_INSET_CARD_CLASS_NAME}>
                <h3 className="text-label-md font-semibold text-text-primary">Resumen de estado</h3>
                <div className="mt-4 space-y-3">
                  {ORDER_FLOW.map((step, index) => {
                    const currentIndex = ORDER_FLOW.indexOf(localOrder.status as OrderStatusValue);
                    const isActive = step === localOrder.status;
                    const isComplete = currentIndex >= index;

                    return (
                      <div key={step} className="flex items-center gap-3">
                        <span
                          className={cx(
                            "flex h-8 w-8 items-center justify-center rounded-full border text-caption font-semibold",
                            isActive
                              ? "border-[#163c31] bg-[#163c31] text-white"
                              : isComplete
                                ? "border-[#72B255] bg-[#eef8ea] text-[#2f6d44]"
                                : "border-[#d8e3d4] bg-white text-text-muted",
                          )}
                        >
                          {index + 1}
                        </span>
                        <span className={cx("text-body-sm", isActive ? "font-semibold text-text-primary" : "text-text-secondary")}>
                          {ORDER_STATUS_LABELS[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className={ADMIN_INSET_CARD_CLASS_NAME}>
                <h3 className="text-label-md font-semibold text-text-primary">Cliente</h3>
                <dl className="mt-4 space-y-2 text-body-sm text-text-secondary">
                  <div className="flex items-start justify-between gap-4">
                    <dt>Email</dt>
                    <dd className="text-right text-text-primary">{localOrder.guestEmail ?? "-"}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Telefono</dt>
                    <dd className="text-right text-text-primary">{localOrder.phone}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Fuente</dt>
                    <dd className="text-right text-text-primary">{localOrder.source}</dd>
                  </div>
                </dl>
              </section>

              <section className={ADMIN_INSET_CARD_CLASS_NAME}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-label-md font-semibold text-text-primary">Direccion</h3>
                  <button
                    type="button"
                    className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}
                    onClick={() => void handleAddressSave()}
                    disabled={pendingAction === "address"}
                  >
                    Guardar cambios
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {ADDRESS_FIELDS.map(({ key, label }) => (
                    <label key={key} className="space-y-1">
                      <span className="text-caption text-text-muted">{label}</span>
                      <input
                        value={addressForm[key]}
                        onChange={(event) =>
                          setAddressForm((current) => ({ ...current, [key]: event.target.value }))
                        }
                        className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className={ADMIN_INSET_CARD_CLASS_NAME}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-label-md font-semibold text-text-primary">Envio</h3>
                  <button
                    type="button"
                    className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}
                    onClick={() => void handleTrackingSave()}
                    disabled={pendingAction === "tracking"}
                  >
                    Guardar tracking
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <p className="text-body-sm text-text-secondary">
                    Metodo: <span className="font-medium text-text-primary">{localOrder.shippingMethodName}</span>
                  </p>
                  <label className="space-y-1">
                    <span className="text-caption text-text-muted">Tracking number</span>
                    <input
                      value={trackingNumber}
                      onChange={(event) => setTrackingNumber(event.target.value)}
                      className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-caption text-text-muted">Tracking URL</span>
                    <input
                      value={trackingUrl}
                      onChange={(event) => setTrackingUrl(event.target.value)}
                      className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                    />
                  </label>
                </div>
              </section>

              <section className={ADMIN_INSET_CARD_CLASS_NAME}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-label-md font-semibold text-text-primary">Pago y estado</h3>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <select
                      value={statusValue}
                      onChange={(event) => setStatusValue(event.target.value as OrderStatusValue)}
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
                      onClick={() => void handleStatusSave()}
                      disabled={pendingAction === "status" || statusValue === localOrder.status}
                    >
                      Guardar estado
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <select
                      value={paymentStatusValue}
                      onChange={(event) => setPaymentStatusValue(event.target.value as PaymentStatusValue)}
                      className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                    >
                      {PAYMENT_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {PAYMENT_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}
                      onClick={() => void handlePaymentStatusSave()}
                      disabled={pendingAction === "payment-status" || paymentStatusValue === localOrder.paymentStatus}
                    >
                      Guardar pago
                    </button>
                  </div>
                  <p className="text-body-sm text-text-secondary">
                    Metodo: <span className="font-medium text-text-primary">{localOrder.paymentMethodName}</span>
                  </p>
                </div>
              </section>

              <section className={ADMIN_INSET_CARD_CLASS_NAME}>
                <h3 className="text-label-md font-semibold text-text-primary">Webhooks recientes</h3>
                <div className="mt-4 space-y-3">
                  {localOrder.webhookEvents.length === 0 ? (
                    <p className="text-body-sm text-text-secondary">Sin eventos registrados para este pedido.</p>
                  ) : (
                    localOrder.webhookEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="rounded-2xl border border-[#d8e3d4] px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-body-sm font-medium text-text-primary">{event.eventType}</span>
                          <span className="text-caption text-text-secondary">{event.status}</span>
                        </div>
                        <p className="mt-1 text-caption text-text-muted">
                          {formatDate(event.createdAt)} · intentos {event.attemptCount}
                        </p>
                        {event.lastError ? (
                          <p className="mt-2 text-caption text-status-error">{event.lastError}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
