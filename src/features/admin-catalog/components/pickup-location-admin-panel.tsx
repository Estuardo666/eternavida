"use client";

import { startTransition, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";

import { ADMIN_COMPACT_FIELD_CLASS_NAME } from "@/components/admin/form-styles";
import {
  ADMIN_BUTTON_DANGER_CLASS_NAME,
  ADMIN_BUTTON_NEUTRAL_SMALL_CLASS_NAME,
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_INSET_CARD_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";
import { MediaPickerModal } from "@/components/media/media-picker-modal";
import { cx } from "@/lib/utils";
import {
  createPickupLocationClient,
  deletePickupLocationClient,
  updatePickupLocationClient,
} from "@/services/admin-catalog/client";
import type {
  AdminCatalogPickupLocationItem,
  AdminPickupLocationFormData,
} from "@/types/admin-catalog";
import type { AdminMediaAssetSummary } from "@/types/admin-home-content";

type SubmissionState = "idle" | "saving" | "success" | "error";

interface PickupLocationAdminPanelProps {
  initialLocations: AdminCatalogPickupLocationItem[];
}

function buildEmptyForm(nextSortOrder = 0): AdminPickupLocationFormData {
  return {
    name: "",
    address: "",
    directionsUrl: "",
    logoMediaId: "",
    isActive: true,
    sortOrder: nextSortOrder,
  };
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function sortLocations(locations: AdminCatalogPickupLocationItem[]) {
  return [...locations].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.name.localeCompare(right.name, "es");
  });
}

export function PickupLocationAdminPanel({ initialLocations }: PickupLocationAdminPanelProps) {
  const [locations, setLocations] = useState(() => sortLocations(initialLocations));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdminPickupLocationFormData>(() => buildEmptyForm(initialLocations.length));
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const activeCount = useMemo(() => locations.filter((loc) => loc.isActive).length, [locations]);
  const inactiveCount = locations.length - activeCount;
  const editingLocation = editingId
    ? locations.find((loc) => loc.id === editingId) ?? null
    : null;

  function resetForm() {
    setEditingId(null);
    setFormData(buildEmptyForm(locations.length));
    setSubmissionState("idle");
    setFeedbackMessage(null);
    setErrorMessage(null);
  }

  function updateField<Key extends keyof AdminPickupLocationFormData>(
    key: Key,
    value: AdminPickupLocationFormData[Key],
  ) {
    setSubmissionState("idle");
    setFeedbackMessage(null);
    setErrorMessage(null);
    setFormData((current) => ({ ...current, [key]: value }));
  }

  function startEdit(location: AdminCatalogPickupLocationItem) {
    setEditingId(location.id);
    setFormData({
      name: location.name,
      address: location.address,
      directionsUrl: location.directionsUrl ?? "",
      logoMediaId: location.logoMediaId ?? "",
      isActive: location.isActive,
      sortOrder: location.sortOrder,
    });
    setSubmissionState("idle");
    setFeedbackMessage(null);
    setErrorMessage(null);
  }

  function handleMediaSelect(asset: AdminMediaAssetSummary) {
    updateField("logoMediaId", asset.id);
    setMediaPickerOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionState("saving");
    setFeedbackMessage(null);
    setErrorMessage(null);

    startTransition(() => {
      void (async () => {
        const location = editingId
          ? await updatePickupLocationClient(editingId, formData)
          : await createPickupLocationClient(formData);

        setLocations((current) => sortLocations([location, ...current.filter((item) => item.id !== location.id)]));
        setSubmissionState("success");
        setFeedbackMessage(editingId ? "Punto de retiro actualizado correctamente." : "Punto de retiro creado correctamente.");
        setEditingId(location.id);
        setFormData({
          name: location.name,
          address: location.address,
          directionsUrl: location.directionsUrl ?? "",
          logoMediaId: location.logoMediaId ?? "",
          isActive: location.isActive,
          sortOrder: location.sortOrder,
        });
      })().catch((error) => {
        setSubmissionState("error");
        setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar el punto de retiro.");
      });
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Se eliminara el punto de retiro seleccionado. Esta accion no se puede deshacer.")) {
      return;
    }

    setSubmissionState("saving");
    setFeedbackMessage(null);
    setErrorMessage(null);

    startTransition(() => {
      void deletePickupLocationClient(id)
        .then((deletedId) => {
          setLocations((current) => sortLocations(current.filter((item) => item.id !== deletedId)));
          if (editingId === deletedId) {
            resetForm();
          } else {
            setSubmissionState("success");
            setFeedbackMessage("Punto de retiro eliminado correctamente.");
          }
        })
        .catch((error) => {
          setSubmissionState("error");
          setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar el punto de retiro.");
        });
    });
  }

  const selectedLogoMedia = locations
    .find((loc) => loc.id === editingId && loc.logoMediaId === formData.logoMediaId)
    ?.logoMediaPublicUrl ?? null;

  return (
    <div className="space-y-6">
      <section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <AdminBreadcrumbs
              items={[
                { label: "Admin", href: "/admin/leads" },
                { label: "Catalogo", href: "/admin/catalog/categories" },
                { label: "Pickup Locations" },
              ]}
            />
            <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Catalogo</p>
            <h1 className="text-section-lg text-text-primary sm:text-headline-sm">Puntos de retiro</h1>
            <p className="max-w-2xl text-body-sm text-text-secondary">
              Gestiona los puntos de retiro disponibles para los pedidos. Cada ubicacion tiene nombre, direccion y opcionalmente un logo.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_320px]">
        <section className={`space-y-5 ${ADMIN_PANEL_SURFACE_CLASS_NAME}`}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={ADMIN_INSET_CARD_CLASS_NAME}>
              <p className="text-caption uppercase tracking-[0.12em] text-text-muted">Total</p>
              <p className="mt-2 text-headline-sm text-text-primary">{locations.length}</p>
              <p className="text-body-sm text-text-secondary">puntos registrados</p>
            </div>
            <div className={ADMIN_INSET_CARD_CLASS_NAME}>
              <p className="text-caption uppercase tracking-[0.12em] text-text-muted">Activos</p>
              <p className="mt-2 text-headline-sm text-text-primary">{activeCount}</p>
              <p className="text-body-sm text-text-secondary">disponibles para pedidos</p>
            </div>
            <div className={ADMIN_INSET_CARD_CLASS_NAME}>
              <p className="text-caption uppercase tracking-[0.12em] text-text-muted">Inactivos</p>
              <p className="mt-2 text-headline-sm text-text-primary">{inactiveCount}</p>
              <p className="text-body-sm text-text-secondary">ocultos para nuevos usos</p>
            </div>
          </div>

          {locations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-soft bg-surface-subtle p-6 text-body-sm text-text-secondary">
              Todavia no hay puntos de retiro. Crea el primero usando el formulario.
            </div>
          ) : (
            <div className="rounded-[24px] border border-border-soft bg-surface-subtle">
              <div className="space-y-3 px-3 py-3 md:hidden">
                {locations.map((location) => (
                  <article key={location.id} className="rounded-2xl border border-border-soft bg-surface-canvas p-4 shadow-[0_14px_28px_-24px_rgba(28,56,41,0.25)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {location.logoMediaPublicUrl ? (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border-soft">
                            <Image src={location.logoMediaPublicUrl} alt={location.logoMediaAltText || location.name} fill sizes="40px" className="object-cover" />
                          </div>
                        ) : null}
                        <div className="space-y-1">
                          <p className="text-label-md text-text-primary">{location.name}</p>
                          <p className="text-body-sm text-text-secondary">{location.address}</p>
                        </div>
                      </div>
                      <span className={cx("inline-flex rounded-full px-2.5 py-0.5 text-label-sm", location.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700")}>
                        {location.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <dl className="mt-4 grid gap-3 text-body-sm text-text-secondary sm:grid-cols-2">
                      <div>
                        <dt className="text-caption uppercase tracking-[0.12em] text-text-muted">Orden</dt>
                        <dd className="mt-1">{location.sortOrder}</dd>
                      </div>
                      <div>
                        <dt className="text-caption uppercase tracking-[0.12em] text-text-muted">Actualizado</dt>
                        <dd className="mt-1">{formatDate(location.updatedAt)}</dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <button type="button" onClick={() => startEdit(location)} className={`${ADMIN_BUTTON_SECONDARY_CLASS_NAME} w-full sm:w-auto`}>
                        Editar
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border-soft text-caption uppercase tracking-[0.12em] text-text-muted">
                      <th className="px-4 py-3 font-medium">Nombre</th>
                      <th className="px-4 py-3 font-medium">Direccion</th>
                      <th className="px-4 py-3 font-medium">Estado</th>
                      <th className="px-4 py-3 font-medium">Orden</th>
                      <th className="px-4 py-3 font-medium">Actualizado</th>
                      <th className="px-4 py-3 font-medium text-right">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((location) => (
                      <tr key={location.id} className="border-b border-border-soft/80 bg-surface-canvas transition-colors hover:bg-surface-subtle/60">
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center gap-3">
                            {location.logoMediaPublicUrl ? (
                              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-border-soft">
                                <Image src={location.logoMediaPublicUrl} alt={location.logoMediaAltText || location.name} fill sizes="36px" className="object-cover" />
                              </div>
                            ) : null}
                            <div className="space-y-1">
                              <p className="text-label-md text-text-primary">{location.name}</p>
                              <p className="text-caption text-text-muted">Creado: {formatDate(location.updatedAt)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-body-sm text-text-secondary">{location.address}</td>
                        <td className="px-4 py-4 align-top">
                          <span className={cx("inline-flex rounded-full px-2.5 py-0.5 text-label-sm", location.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700")}>
                            {location.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top text-body-sm text-text-secondary">{location.sortOrder}</td>
                        <td className="px-4 py-4 align-top text-body-sm text-text-secondary">{formatDate(location.updatedAt)}</td>
                        <td className="px-4 py-4 text-right align-top">
                          <button type="button" onClick={() => startEdit(location)} className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}>
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <div className="space-y-2 border-b border-border-soft pb-5">
              <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Editor</p>
              <h2 className="text-section-lg text-text-primary">{editingLocation ? "Editar punto de retiro" : "Nuevo punto de retiro"}</h2>
              <p className="text-body-sm text-text-secondary">
                {editingLocation
                  ? `Ultima actualizacion: ${formatDate(editingLocation.updatedAt)}`
                  : "Completa los campos para crear un nuevo punto de retiro."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Nombre</span>
                <input
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                  placeholder="Sucursal Centro"
                />
              </label>

              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Direccion</span>
                <input
                  value={formData.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                  placeholder="Av. Principal 123"
                />
              </label>

              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">URL de indicaciones</span>
                <input
                  value={formData.directionsUrl}
                  onChange={(event) => updateField("directionsUrl", event.target.value)}
                  className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                  placeholder="https://maps.google.com/..."
                />
              </label>

              <div className="space-y-2">
                <span className="block text-label-md text-text-primary">Logo</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setMediaPickerOpen(true)} className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}>
                    {formData.logoMediaId ? "Cambiar logo" : "Elegir logo"}
                  </button>
                  {formData.logoMediaId ? (
                    <button type="button" onClick={() => updateField("logoMediaId", "")} className={ADMIN_BUTTON_NEUTRAL_SMALL_CLASS_NAME}>
                      Quitar
                    </button>
                  ) : null}
                </div>
                {selectedLogoMedia ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border-soft">
                    <Image src={selectedLogoMedia} alt="Logo preview" fill sizes="64px" className="object-cover" />
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Orden</span>
                  <input
                    type="number"
                    min={0}
                    value={formData.sortOrder}
                    onChange={(event) => updateField("sortOrder", Number(event.target.value))}
                    className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                  />
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface-subtle px-4 py-3 text-body-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(event) => updateField("isActive", event.target.checked)}
                    className="h-4 w-4 rounded border-border-default"
                  />
                  Activo
                </label>
              </div>

              {errorMessage ? <p className="text-body-sm text-status-error">{errorMessage}</p> : null}
              {feedbackMessage ? <p className="text-body-sm text-status-success">{feedbackMessage}</p> : null}

              <div className="flex flex-wrap items-center gap-3 border-t border-border-soft pt-5">
                <button type="submit" disabled={submissionState === "saving"} className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}>
                  {submissionState === "saving"
                    ? "Guardando..."
                    : editingLocation
                      ? "Actualizar"
                      : "Crear"}
                </button>

                {(editingLocation || formData.name) ? (
                  <button type="button" onClick={resetForm} className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}>
                    Cancelar
                  </button>
                ) : null}

                {editingLocation ? (
                  <button type="button" onClick={() => handleDelete(editingLocation.id)} className={ADMIN_BUTTON_DANGER_CLASS_NAME}>
                    Eliminar
                  </button>
                ) : null}
              </div>
            </form>
          </section>
        </aside>
      </div>

      <MediaPickerModal
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        uploadStorageKeyPrefix="Media/PickupLocations"
      />
    </div>
  );
}
