"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  FileText,
  X,
} from "lucide-react";
import { ecuadorProvinces } from "@/config/ecuador-provinces";
import { cx } from "@/lib/utils";

const FIELD_CLASS =
  "h-10 w-full rounded-lg border border-border-soft bg-white px-3.5 text-body-sm text-text-primary placeholder:text-text-muted transition hover:border-brand-primary/40 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none disabled:bg-surface-subtle disabled:text-text-muted";

const SELECT_CLASS =
  "h-10 w-full rounded-lg border border-border-soft bg-white px-3 py-2 text-body-sm font-medium text-text-primary transition-[border-color,box-shadow,background-color] duration-fast hover:border-border-brand hover:bg-brand-soft/20 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20";

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-label-md font-semibold text-white transition-colors hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50";

const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border-soft bg-surface-subtle px-5 py-3 text-label-md font-medium text-text-primary transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50";

const CARD_CLASS = "rounded-xl border border-border-soft bg-surface-subtle p-5 sm:p-6";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

interface Address {
  id: string;
  type: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string | null;
  province: string;
  city: string;
  phone: string;
  idNumber: string | null;
  isDefault: boolean;
  createdAt: string;
}

type AddressFormData = {
  type: "SHIPPING" | "BILLING";
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  province: string;
  city: string;
  phone: string;
  idNumber: string;
  isDefault: boolean;
};

const EMPTY_FORM: AddressFormData = {
  type: "SHIPPING",
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  province: "",
  city: "",
  phone: "",
  idNumber: "",
  isDefault: false,
};

export default function CuentaDireccionesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormData>({ ...EMPTY_FORM });
  const [formState, setFormState] = useState<"idle" | "saving">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/addresses");
      const payload = (await response.json()) as { success?: boolean; error?: string; data?: Address[] };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? "No se pudieron cargar las direcciones.");
      }
      setAddresses(payload.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Error al cargar direcciones.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadAddresses(); }, [loadAddresses]);

  const shippingAddresses = addresses.filter((a) => a.type === "SHIPPING");
  const billingAddresses = addresses.filter((a) => a.type === "BILLING");

  function openCreateForm(type: "SHIPPING" | "BILLING") {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, type });
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(address: Address) {
    setEditingId(address.id);
    setForm({
      type: address.type as "SHIPPING" | "BILLING",
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      apartment: address.apartment ?? "",
      province: address.province,
      city: address.city,
      phone: address.phone,
      idNumber: address.idNumber ?? "",
      isDefault: address.isDefault,
    });
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("saving");
    setFormError(null);

    try {
      const url = editingId ? `/api/addresses/${editingId}` : "/api/addresses";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "Error al guardar dirección.");
      }

      closeForm();
      await loadAddresses();
      setActionMessage(editingId ? "Dirección actualizada." : "Dirección creada.");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setFormState("idle");
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      const payload = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "Error al eliminar dirección.");
      }

      setDeleteConfirm(null);
      await loadAddresses();
      setActionMessage("Dirección eliminada.");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Error al eliminar.");
    }
  }

  async function handleSetDefault(id: string) {
    try {
      const response = await fetch(`/api/addresses/${id}/set-default`, { method: "POST" });
      const payload = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "Error al establecer predeterminada.");
      }

      await loadAddresses();
      setActionMessage("Dirección predeterminada actualizada.");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Error al actualizar.");
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: EASE }}
        className="space-y-1"
      >
        <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Cuenta</p>
        <h1 className="text-headline-sm text-text-primary">Mis direcciones</h1>
      </motion.div>

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={CARD_CLASS}
        >
          <div className="flex items-center justify-center py-14 text-body-sm text-text-secondary">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando direcciones...
          </div>
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={CARD_CLASS}
        >
          <div className="space-y-4 py-10 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-status-error" />
            <p className="text-body-sm text-status-error">{error}</p>
            <button type="button" onClick={() => void loadAddresses()} className={BTN_SECONDARY}>
              Reintentar
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Shipping addresses */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: EASE, delay: 0.1 }}
            className={CARD_CLASS}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-text-muted" />
                <h2 className="text-section-lg text-text-primary">Direcciones de envío</h2>
              </div>
              <button
                type="button"
                onClick={() => openCreateForm("SHIPPING")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-white px-3 py-2 text-label-sm font-medium text-text-primary transition-colors hover:border-border-brand hover:text-text-brand"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar
              </button>
            </div>

            {shippingAddresses.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border-soft py-8 text-center">
                <MapPin className="mx-auto h-8 w-8 text-text-muted opacity-40" />
                <p className="mt-2 text-body-sm text-text-muted">No tienes direcciones de envío guardadas.</p>
                <button
                  type="button"
                  onClick={() => openCreateForm("SHIPPING")}
                  className="mt-3 text-label-sm font-medium text-text-brand underline-offset-2 hover:underline"
                >
                  Agregar tu primera dirección
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {shippingAddresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    onEdit={() => openEditForm(addr)}
                    onDelete={() => setDeleteConfirm(addr.id)}
                    onSetDefault={() => void handleSetDefault(addr.id)}
                  />
                ))}
              </div>
            )}
          </motion.section>

          {/* Billing addresses */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: EASE, delay: 0.15 }}
            className={CARD_CLASS}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-text-muted" />
                <h2 className="text-section-lg text-text-primary">Direcciones de facturación</h2>
              </div>
              <button
                type="button"
                onClick={() => openCreateForm("BILLING")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-white px-3 py-2 text-label-sm font-medium text-text-primary transition-colors hover:border-border-brand hover:text-text-brand"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar
              </button>
            </div>

            {billingAddresses.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border-soft py-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-text-muted opacity-40" />
                <p className="mt-2 text-body-sm text-text-muted">No tienes direcciones de facturación guardadas.</p>
                <button
                  type="button"
                  onClick={() => openCreateForm("BILLING")}
                  className="mt-3 text-label-sm font-medium text-text-brand underline-offset-2 hover:underline"
                >
                  Agregar dirección de facturación
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {billingAddresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    onEdit={() => openEditForm(addr)}
                    onDelete={() => setDeleteConfirm(addr.id)}
                    onSetDefault={() => void handleSetDefault(addr.id)}
                  />
                ))}
              </div>
            )}
          </motion.section>
        </>
      )}

      {/* Action message */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-border-soft bg-white px-5 py-3 shadow-lg"
          >
            <div className="flex items-center gap-2 text-body-sm">
              <CheckCircle2 className="h-4 w-4 text-status-success" />
              <span>{actionMessage}</span>
              <button type="button" onClick={() => setActionMessage(null)} className="ml-2 text-text-muted hover:text-text-primary">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-xl border border-border-soft bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-section-lg text-text-primary">Eliminar dirección</h3>
              <p className="mt-2 text-body-sm text-text-secondary">
                ¿Estás seguro de que quieres eliminar esta dirección? Esta acción no se puede deshacer.
              </p>
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setDeleteConfirm(null)} className={cx("flex-1", BTN_SECONDARY)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(deleteConfirm)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-status-error px-5 py-3 text-label-md font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-error focus-visible:ring-offset-2"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 sm:items-center sm:p-4"
            onClick={closeForm}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border-soft bg-white p-6 shadow-xl sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-section-lg text-text-primary">
                  {editingId ? "Editar dirección" : "Nueva dirección"}
                </h2>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-subtle hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block space-y-1.5">
                    <span className="block text-label-md text-text-primary">Nombre</span>
                    <input
                      required
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                      className={FIELD_CLASS}
                      placeholder="Nombre"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="block text-label-md text-text-primary">Apellido</span>
                    <input
                      required
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      className={FIELD_CLASS}
                      placeholder="Apellido"
                    />
                  </label>
                </div>

                <label className="block space-y-1.5">
                  <span className="block text-label-md text-text-primary">Dirección</span>
                  <input
                    required
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className={FIELD_CLASS}
                    placeholder="Calle y número exterior"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="block text-label-md text-text-primary">Apartamento, suite, etc.</span>
                  <input
                    value={form.apartment}
                    onChange={(e) => setForm((f) => ({ ...f, apartment: e.target.value }))}
                    className={FIELD_CLASS}
                    placeholder="Opcional"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block space-y-1.5">
                    <span className="block text-label-md text-text-primary">Provincia</span>
                    <select
                      required
                      value={form.province}
                      onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                      className={SELECT_CLASS}
                    >
                      <option value="">Seleccionar</option>
                      {ecuadorProvinces.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="block text-label-md text-text-primary">Ciudad</span>
                    <input
                      required
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      className={FIELD_CLASS}
                      placeholder="Ciudad"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block space-y-1.5">
                    <span className="block text-label-md text-text-primary">Teléfono</span>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className={FIELD_CLASS}
                      placeholder="+593 99 000 0000"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="block text-label-md text-text-primary">
                      {form.type === "BILLING" ? "RUC" : "Cédula o RUC"}
                    </span>
                    <input
                      value={form.idNumber}
                      onChange={(e) => setForm((f) => ({ ...f, idNumber: e.target.value }))}
                      className={FIELD_CLASS}
                      placeholder="Opcional"
                    />
                  </label>
                </div>

                <label className="flex items-center gap-2.5 text-body-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                    className="h-4 w-4 rounded border-border-strong text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Establecer como predeterminada</span>
                </label>

                {formError && (
                  <p className="text-body-sm text-status-error">{formError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeForm} className={cx("flex-1", BTN_SECONDARY)}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formState === "saving"}
                    className={cx("flex-1", BTN_PRIMARY)}
                  >
                    {formState === "saving" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : editingId ? (
                      "Actualizar dirección"
                    ) : (
                      "Guardar dirección"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const provinceName = ecuadorProvinces.find((p) => p.id === address.province)?.name ?? address.province;

  return (
    <div className="rounded-lg border border-border-soft bg-white/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 text-body-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <p className="font-medium text-text-primary">{address.firstName} {address.lastName}</p>
            {address.isDefault && (
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-primary/30 bg-brand-soft/30 px-2 py-0.5 text-caption font-medium text-text-brand">
                <Star className="h-3 w-3 fill-current" />
                Predeterminada
              </span>
            )}
          </div>
          <p>{address.address}</p>
          {address.apartment && <p>{address.apartment}</p>}
          <p>{address.city}, {provinceName}</p>
          {address.phone && <p>Tel: {address.phone}</p>}
          {address.idNumber && <p>Cédula/RUC: {address.idNumber}</p>}
        </div>

        <div className="flex shrink-0 gap-1.5">
          {!address.isDefault && (
            <button
              type="button"
              onClick={onSetDefault}
              title="Establecer como predeterminada"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-brandTint hover:text-text-brand"
            >
              <Star className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            title="Editar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Eliminar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-red-50 hover:text-status-error"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
