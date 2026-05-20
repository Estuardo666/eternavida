"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  ADMIN_COMPACT_FIELD_CLASS_NAME,
} from "@/components/admin/form-styles";
import {
  ADMIN_BUTTON_DANGER_CLASS_NAME,
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_INSET_CARD_CLASS_NAME,
  ADMIN_LIST_ITEM_ACTIVE_CLASS_NAME,
  ADMIN_LIST_ITEM_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
  ADMIN_STICKY_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";
import { cx } from "@/lib/utils";
import {
  createPaymentMethodClient,
  updatePaymentMethodClient,
  deletePaymentMethodClient,
} from "@/services/admin-payment-methods/client";
import type { PaymentMethodFormData, PaymentMethodItem } from "@/types/admin-payment-methods";

type SubmissionState = "idle" | "saving" | "success" | "error";

interface PaymentMethodEditorState {
  name: string;
  description: string;
  type: string;
  instructions: string;
  initialOrderStatus: "pending" | "confirmed";
  isActive: boolean;
  sortOrder: string;
}

const DEFAULT_STATE: PaymentMethodEditorState = {
  name: "",
  description: "",
  type: "",
  instructions: "",
  initialOrderStatus: "pending",
  isActive: true,
  sortOrder: "0",
};

function toEditorState(method: PaymentMethodItem): PaymentMethodEditorState {
  return {
    name: method.name,
    description: method.description ?? "",
    type: method.type,
    instructions: method.instructions ?? "",
    initialOrderStatus: method.initialOrderStatus === "confirmed" ? "confirmed" : "pending",
    isActive: method.isActive,
    sortOrder: String(method.sortOrder),
  };
}

function toFormData(state: PaymentMethodEditorState): PaymentMethodFormData {
  return {
    name: state.name.trim(),
    description: state.description.trim(),
    type: state.type.trim(),
    instructions: state.instructions.trim(),
    initialOrderStatus: state.initialOrderStatus,
    isActive: state.isActive,
    sortOrder: parseInt(state.sortOrder, 10) || 0,
  };
}

interface Props {
  initialMethods: PaymentMethodItem[];
}

export function PaymentMethodAdminPanel({ initialMethods }: Props) {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethodItem[]>(initialMethods);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<PaymentMethodEditorState>(DEFAULT_STATE);
  const [submitState, setSubmitState] = useState<SubmissionState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedMethod = methods.find((m) => m.id === selectedId) ?? null;
  const isDirty = selectedId !== null || isCreating;

  function handleSelectMethod(method: PaymentMethodItem) {
    setSelectedId(method.id);
    setIsCreating(false);
    setForm(toEditorState(method));
    setSubmitState("idle");
    setSubmitError(null);
    setDeleteConfirmId(null);
  }

  function handleCreateNew() {
    setSelectedId(null);
    setIsCreating(true);
    setForm(DEFAULT_STATE);
    setSubmitState("idle");
    setSubmitError(null);
    setDeleteConfirmId(null);
  }

  function handleCancel() {
    setSelectedId(null);
    setIsCreating(false);
    setForm(DEFAULT_STATE);
    setSubmitState("idle");
    setSubmitError(null);
    setDeleteConfirmId(null);
  }

  function updateField<K extends keyof PaymentMethodEditorState>(
    key: K,
    value: PaymentMethodEditorState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (submitState !== "idle") setSubmitState("idle");
    setSubmitError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitState === "saving") return;
    setSubmitState("saving");
    setSubmitError(null);

    try {
      const data = toFormData(form);
      if (isCreating) {
        const created = await createPaymentMethodClient(data);
        setMethods((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
        setSelectedId(created.id);
        setIsCreating(false);
        setForm(toEditorState(created));
      } else if (selectedId) {
        const updated = await updatePaymentMethodClient(selectedId, data);
        setMethods((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m)).sort((a, b) => a.sortOrder - b.sortOrder),
        );
        setForm(toEditorState(updated));
      }
      setSubmitState("success");
      router.refresh();
    } catch (error) {
      setSubmitState("error");
      setSubmitError(error instanceof Error ? error.message : "Error desconocido.");
    }
  }

  async function handleDelete(id: string) {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    setIsDeleting(true);
    try {
      await deletePaymentMethodClient(id);
      setMethods((prev) => prev.filter((m) => m.id !== id));
      if (selectedId === id) handleCancel();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo eliminar.");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <AdminBreadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Métodos de pago" },
          ]}
        />
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-section-md font-semibold text-text-primary">Métodos de pago</h1>
            <p className="mt-1 text-body-sm text-text-secondary">
              Configurá los métodos de pago disponibles en el checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateNew}
            className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}
            disabled={isCreating}
          >
            + Nuevo método
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_440px]">
        {/* List */}
        <div className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
          <h2 className="mb-3 text-label-md font-semibold text-text-primary">
            Métodos configurados
            <span className="ml-2 text-label-sm font-normal text-text-secondary">({methods.length})</span>
          </h2>
          {methods.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c8d9c4] p-8 text-center">
              <p className="text-body-sm text-text-secondary">No hay métodos de pago. Creá el primero.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {methods.map((method) => (
                <li key={method.id}>
                  <button
                    type="button"
                    className={method.id === selectedId ? ADMIN_LIST_ITEM_ACTIVE_CLASS_NAME : ADMIN_LIST_ITEM_CLASS_NAME}
                    onClick={() => handleSelectMethod(method)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-label-sm font-semibold text-text-primary">
                            {method.name}
                          </span>
                          {!method.isActive && (
                            <span className="shrink-0 rounded-full bg-[#f3f0e8] px-2 py-0.5 text-caption text-[#8a7a2e]">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-caption text-text-secondary">
                          <span className="font-mono">{method.type}</span>
                          {method.description && <span>· {method.description}</span>}
                          <span>· Inicia: {method.initialOrderStatus ?? "pending"}</span>
                        </div>
                      </div>
                      <span className="shrink-0 text-caption text-text-secondary">#{method.sortOrder}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Editor */}
        {isDirty && (
          <div className={ADMIN_STICKY_PANEL_SURFACE_CLASS_NAME}>
            <h2 className="mb-4 text-label-md font-semibold text-text-primary">
              {isCreating ? "Nuevo método de pago" : "Editar método de pago"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-label-sm text-text-secondary">
                  Nombre <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                  placeholder="Ej. Transferencia bancaria"
                  required
                  maxLength={120}
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-label-sm text-text-secondary">Descripción</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                  placeholder="Descripción breve opcional"
                  maxLength={500}
                />
              </div>

              {/* Type + sortOrder row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-label-sm text-text-secondary">
                    Tipo <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.type}
                    onChange={(e) => updateField("type", e.target.value)}
                    className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                    placeholder="Ej. bank_transfer"
                    required
                    maxLength={80}
                  />
                  <p className="mt-1 text-caption text-text-secondary">Identificador único (minúsculas).</p>
                </div>
                <div>
                  <label className="mb-1 block text-label-sm text-text-secondary">Estado inicial del pedido</label>
                  <select
                    value={form.initialOrderStatus}
                    onChange={(e) => updateField("initialOrderStatus", e.target.value as PaymentMethodEditorState["initialOrderStatus"])}
                    className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-label-sm text-text-secondary">Orden</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => updateField("sortOrder", e.target.value)}
                    className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                    min={0}
                    step={1}
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="mb-1 block text-label-sm text-text-secondary">
                  Instrucciones para el cliente
                </label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => updateField("instructions", e.target.value)}
                  className={cx(ADMIN_COMPACT_FIELD_CLASS_NAME, "min-h-[120px] resize-y")}
                  placeholder={"Banco: ...\nCuenta: ...\nBeneficiario: Dermatologika\nEnvía tu comprobante por WhatsApp"}
                  maxLength={2000}
                />
                <p className="mt-1 text-caption text-text-secondary">
                  Estas instrucciones se muestran al cliente tras seleccionar este método.
                </p>
              </div>

              {/* isActive */}
              <div className={cx(ADMIN_INSET_CARD_CLASS_NAME, "flex items-center justify-between")}>
                <div>
                  <p className="text-label-sm font-medium text-text-primary">Activo</p>
                  <p className="text-caption text-text-secondary">Visible en el checkout para los clientes.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isActive}
                  onClick={() => updateField("isActive", !form.isActive)}
                  className={cx(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2",
                    form.isActive ? "bg-[#163c31]" : "bg-[#c8d4c4]",
                  )}
                >
                  <span
                    className={cx(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                      form.isActive ? "translate-x-5" : "translate-x-0.5",
                    )}
                  />
                </button>
              </div>

              {/* Feedback */}
              {submitError && (
                <p className="rounded-xl bg-[#fde8e8] px-3 py-2 text-body-sm text-status-error">
                  {submitError}
                </p>
              )}
              {submitState === "success" && (
                <p className="rounded-xl bg-[#e8f5eb] px-3 py-2 text-body-sm text-[#1a5c2e]">
                  Guardado correctamente.
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitState === "saving"}
                  className={cx(ADMIN_BUTTON_PRIMARY_CLASS_NAME, "flex-1")}
                >
                  {submitState === "saving" ? "Guardando…" : isCreating ? "Crear método" : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
                >
                  Cancelar
                </button>
              </div>

              {/* Delete */}
              {selectedMethod && (
                <div className="border-t border-[#e4ede1] pt-3">
                  {deleteConfirmId === selectedMethod.id ? (
                    <div className="space-y-2">
                      <p className="text-body-sm text-status-error">
                        ¿Confirmás eliminar <strong>{selectedMethod.name}</strong>? Esta acción no se puede deshacer.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(selectedMethod.id)}
                          disabled={isDeleting}
                          className={cx(ADMIN_BUTTON_DANGER_CLASS_NAME, "flex-1")}
                        >
                          {isDeleting ? "Eliminando…" : "Confirmar eliminación"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedMethod.id)}
                      className={ADMIN_BUTTON_DANGER_CLASS_NAME}
                    >
                      Eliminar método
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
