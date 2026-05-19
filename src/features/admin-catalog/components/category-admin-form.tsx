"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
	ADMIN_COMPACT_FIELD_CLASS_NAME,
	ADMIN_COMPACT_PROMINENT_FIELD_CLASS_NAME,
	ADMIN_COMPACT_READONLY_FIELD_CLASS_NAME,
} from "@/components/admin/form-styles";
import {
	ADMIN_BUTTON_DANGER_CLASS_NAME,
	ADMIN_BUTTON_PRIMARY_CLASS_NAME,
	ADMIN_BUTTON_SECONDARY_CLASS_NAME,
	ADMIN_HERO_SURFACE_CLASS_NAME,
	ADMIN_INSET_CARD_CLASS_NAME,
	ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";
import { MediaAssetFrame } from "@/components/media/media-asset-frame";
import { MediaPickerModal } from "@/components/media/media-picker-modal";
import { cx } from "@/lib/utils";
import {
	buildCatalogMediaStorageKey,
	buildCategoryHref,
	slugifyCatalogName,
} from "@/lib/catalog-slugs";
import { uploadMediaAsset } from "@/services/admin-content/client";
import {
	createCategoryClient,
	deleteCategoryClient,
	updateCategoryClient,
} from "@/services/admin-catalog/client";
import type {
	AdminCatalogCategoryItem,
	AdminCatalogEditorData,
	AdminCategoryFormData,
} from "@/types/admin-catalog";
import type { MediaAsset } from "@/types/media";

type SubmissionState = "idle" | "saving" | "success" | "error";

const adminFieldClassName = ADMIN_COMPACT_FIELD_CLASS_NAME;
const adminReadonlyFieldClassName = ADMIN_COMPACT_READONLY_FIELD_CLASS_NAME;

interface CategoryAdminFormProps {
	initialData: AdminCatalogEditorData;
	mode: "create" | "edit";
	category?: AdminCatalogCategoryItem | null;
}

function buildCategoryForm(category?: AdminCatalogCategoryItem | null): AdminCategoryFormData {
	if (!category) {
		return {
			slug: "",
			name: "",
			description: "",
			href: "",
			isActive: true,
			mediaAssetId: "",
		};
	}

	return {
		slug: category.slug,
		name: category.name,
		description: category.description,
		href: category.href,
		isActive: category.isActive,
		mediaAssetId: category.mediaAssetId ?? "",
	};
}

function mapMediaAssetSummaryToMediaAsset(
	mediaAsset: AdminCatalogEditorData["mediaAssets"][number] | null,
): MediaAsset | null {
	if (!mediaAsset) {
		return null;
	}

	return {
		id: mediaAsset.id,
		kind: mediaAsset.kind,
		url: mediaAsset.publicUrl,
		storageKey: mediaAsset.storageKey,
		altText: mediaAsset.altText,
		mimeType: mediaAsset.mimeType,
		posterUrl: mediaAsset.posterUrl,
		width: mediaAsset.width ?? null,
		height: mediaAsset.height ?? null,
		durationSeconds: mediaAsset.durationSeconds ?? null,
	};
}

function mapCategoryItemToMediaAsset(category: AdminCatalogCategoryItem | null): MediaAsset | null {
	if (!category?.mediaAssetId || !category.mediaAssetPublicUrl) {
		return null;
	}

	return {
		id: category.mediaAssetId,
		kind: "image",
		url: category.mediaAssetPublicUrl,
		storageKey: null,
		altText: category.mediaAssetAltText,
		mimeType: null,
		posterUrl: null,
		width: null,
		height: null,
		durationSeconds: null,
	};
}

function buildLocalPreviewAsset(input: {
	file: File | null;
	previewUrl: string | null;
	name: string;
}): MediaAsset | null {
	if (!input.file || !input.previewUrl) {
		return null;
	}

	return {
		id: "local-category-preview",
		kind: "image",
		url: input.previewUrl,
		storageKey: null,
		altText: input.name.trim() || input.file.name,
		mimeType: input.file.type || null,
		posterUrl: null,
		width: null,
		height: null,
		durationSeconds: null,
	};
}

function formatDate(value: string): string {
	return new Intl.DateTimeFormat("es-ES", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export function CategoryAdminForm({ initialData, mode, category }: CategoryAdminFormProps) {
	const router = useRouter();
	const [formData, setFormData] = useState<AdminCategoryFormData>(() => buildCategoryForm(category));
	const [persistedCategory, setPersistedCategory] = useState<AdminCatalogCategoryItem | null>(category ?? null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
	const [fileInputKey, setFileInputKey] = useState(0);
	const [pickerOpen, setPickerOpen] = useState(false);
	const [pickedAsset, setPickedAsset] = useState<AdminCatalogEditorData["mediaAssets"][number] | null>(null);
	const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(buildCategoryForm(category)));
	const [savedAt, setSavedAt] = useState<string | null>(category?.updatedAt ?? null);
	const selectedMedia = pickedAsset ?? initialData.mediaAssets.find((asset) => asset.id === formData.mediaAssetId) ?? null;
	const previewAsset =
		buildLocalPreviewAsset({
			file: imageFile,
			previewUrl: imagePreviewUrl,
			name: formData.name,
		}) ?? mapMediaAssetSummaryToMediaAsset(selectedMedia) ?? mapCategoryItemToMediaAsset(persistedCategory);
	const isDirty = savedSnapshot !== JSON.stringify(formData) || Boolean(imageFile);
	const saveStatusLabel =
		submissionState === "saving"
			? "Guardando cambios..."
			: submissionState === "error"
				? "Error al guardar"
				: isDirty
					? "Cambios sin guardar"
					: savedAt
						? `Guardado ${formatDate(savedAt).toLowerCase()}`
						: mode === "create"
							? "Lista para crear"
							: "Sin cambios pendientes";
	const saveStatusTone =
		submissionState === "saving"
			? "border-amber-200 bg-amber-50 text-amber-800"
			: submissionState === "error"
				? "border-status-error/30 bg-status-error/10 text-status-error"
				: isDirty
					? "border-[#f2b27f] bg-[#fff4e8] text-[#b45309]"
					: "border-emerald-200 bg-emerald-50 text-emerald-800";
	const showUnsavedWarning = submissionState !== "saving" && submissionState !== "error" && isDirty;

	useEffect(() => {
		return () => {
			if (imagePreviewUrl) {
				URL.revokeObjectURL(imagePreviewUrl);
			}
		};
	}, [imagePreviewUrl]);

	function markAsDirty() {
		setSubmissionState((current) => (current === "saving" ? current : "idle"));
	}

	function resetPendingImageSelection() {
		if (imagePreviewUrl) {
			URL.revokeObjectURL(imagePreviewUrl);
		}

		setImageFile(null);
		setImagePreviewUrl(null);
		setFileInputKey((current) => current + 1);
	}

	function updateField<Key extends keyof AdminCategoryFormData>(key: Key, value: AdminCategoryFormData[Key]) {
		markAsDirty();
		setFormData((current) => ({ ...current, [key]: value }));
	}

	function updateName(name: string) {
		markAsDirty();
		const slug = slugifyCatalogName(name);
		setFormData((current) => ({
			...current,
			name,
			slug,
			href: slug ? buildCategoryHref(slug) : "",
		}));
	}

	function clearImageSelection(removePersistedAsset = false) {
		markAsDirty();
		resetPendingImageSelection();
		setPickedAsset(null);

		if (removePersistedAsset) {
			updateField("mediaAssetId", "");
		}
	}

	function handlePickerSelect(asset: AdminCatalogEditorData["mediaAssets"][number]) {
		markAsDirty();
		resetPendingImageSelection();
		setPickedAsset(asset);
		updateField("mediaAssetId", asset.id);
	}

	function handleImageChange(file: File | null) {
		markAsDirty();
		resetPendingImageSelection();

		setImageFile(file);
		setImagePreviewUrl(file ? URL.createObjectURL(file) : null);
		setErrorMessage(null);
	}

	async function uploadCategoryImage(file: File, name: string) {
		const slug = slugifyCatalogName(name);
		if (!slug) {
			throw new Error("El nombre es obligatorio para generar slug, href y la ruta de la imagen.");
		}

		const mediaAsset = await uploadMediaAsset(file, {
			storageKey: buildCatalogMediaStorageKey("categories", slug, file.name),
			kind: "image",
			altText: name.trim(),
		});

		return mediaAsset.id;
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmissionState("saving");
		setErrorMessage(null);

		try {
			const slug = slugifyCatalogName(formData.name);
			const payload: AdminCategoryFormData = {
				...formData,
				slug,
				href: slug ? buildCategoryHref(slug) : "",
				mediaAssetId: formData.mediaAssetId,
			};

			if (imageFile) {
				payload.mediaAssetId = await uploadCategoryImage(imageFile, formData.name);
			}

			if (mode === "edit" && category) {
				const updated = await updateCategoryClient(category.id, payload);
				const nextFormData = buildCategoryForm(updated);
				setFormData(nextFormData);
				setPersistedCategory(updated);
				setSavedSnapshot(JSON.stringify(nextFormData));
				setSavedAt(updated.updatedAt);
				resetPendingImageSelection();
				setSubmissionState("success");
				router.refresh();
				return;
			}

			const created = await createCategoryClient(payload);
			router.push(`/admin/catalog/categories/${created.id}`);
			router.refresh();
		} catch (error) {
			setSubmissionState("error");
			if (error instanceof TypeError && /failed to fetch/i.test(error.message)) {
				setErrorMessage("No se pudo conectar con el servidor. Verifica que la app esté corriendo e intenta de nuevo.");
				return;
			}

			setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar la categoria.");
		}
	}

	async function handleDelete() {
		if (!category) {
			return;
		}

		if (!window.confirm("Se eliminara la categoria seleccionada. Esta accion no se puede deshacer.")) {
			return;
		}

		setSubmissionState("saving");
		setErrorMessage(null);

		try {
			await deleteCategoryClient(category.id);
			router.push("/admin/catalog/categories");
			router.refresh();
		} catch (error) {
			setSubmissionState("error");
			setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar la categoria.");
		}
	}

	return (
		<div className="space-y-6">
			<section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div className="space-y-2">
						<AdminBreadcrumbs
							items={[
								{ label: "Admin", href: "/admin/leads" },
								{ label: "Catalogo", href: "/admin/catalog/categories" },
								{ label: "Categorias", href: "/admin/catalog/categories" },
								{ label: mode === "create" ? "Nueva" : formData.name || "Editar" },
							]}
						/>
						<p className="text-caption uppercase tracking-[0.14em] text-text-muted">Taxonomia</p>
						<h1 className="text-section-lg text-text-primary sm:text-headline-sm">{mode === "create" ? "Nueva categoria" : "Editar categoria"}</h1>
					</div>

					<div className="w-full max-w-[420px] space-y-2 lg:w-auto lg:min-w-[340px] lg:max-w-none">
						<div className={cx("inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-center text-label-sm", saveStatusTone)}>
							{showUnsavedWarning ? (
								<svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
									<path fill="currentColor" d="M10 2.5a1.3 1.3 0 0 1 1.14.67l6.8 11.97a1.3 1.3 0 0 1-1.14 1.96H3.2a1.3 1.3 0 0 1-1.14-1.96l6.8-11.97A1.3 1.3 0 0 1 10 2.5Zm0 4.1a.75.75 0 0 0-.75.75v4.1a.75.75 0 0 0 1.5 0v-4.1A.75.75 0 0 0 10 6.6Zm0 8.1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
								</svg>
							) : null}
							<span>{saveStatusLabel}</span>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<Link href="/admin/catalog/categories" className="inline-flex min-h-10 items-center justify-center rounded-pill border border-border-default bg-surface-canvas px-4 py-2 text-center text-label-sm text-text-primary transition-[background-color,border-color,color] duration-[200ms] ease-soft hover:border-border-strong hover:bg-surface-soft active:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas">
								Volver al listado
							</Link>
							<Link href="/admin/catalog/categories/new" className="inline-flex min-h-10 items-center justify-center rounded-pill bg-brand-primary px-4 py-2 text-center text-label-sm text-text-inverse shadow-sm transition-[background-color,border-color,color] duration-[200ms] ease-soft hover:bg-emerald-600 active:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas">
								Nueva categoria
							</Link>
						</div>
					</div>
				</div>
			</section>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_320px]">
				<section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
					<form id="category-form" onSubmit={handleSubmit} className="space-y-6">
						<div className="rounded-2xl bg-surface-subtle p-4">
							<div className="space-y-4">
								<label className="space-y-2 block">
									<span className="block text-label-md text-text-primary">Nombre</span>
									<input value={formData.name} onChange={(event) => updateName(event.target.value)} className={ADMIN_COMPACT_PROMINENT_FIELD_CLASS_NAME} placeholder="Dermocosmetica" />
								</label>

								<div className="grid gap-3 md:grid-cols-2">
									<label className="space-y-1">
										<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Slug</span>
										<input value={formData.slug} readOnly className={adminReadonlyFieldClassName} placeholder="Se genera desde el nombre" />
									</label>

									<label className="space-y-1">
										<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Href</span>
										<input value={formData.href} readOnly className={adminReadonlyFieldClassName} placeholder="Se genera automaticamente" />
									</label>
								</div>
							</div>
						</div>

						<label className="space-y-2 block">
							<span className="block text-label-md text-text-primary">Descripcion</span>
							<textarea value={formData.description} onChange={(event) => updateField("description", event.target.value)} rows={4} className={ADMIN_COMPACT_FIELD_CLASS_NAME} />
						</label>

						<div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
							<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
								<div className="space-y-2">
									<span className="block text-label-md text-text-primary">Imagen de categoria</span>
									<button
										type="button"
										onClick={() => setPickerOpen(true)}
										className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
									>
										<svg viewBox="0 0 24 24" fill="none" className="mr-2 h-4 w-4" aria-hidden="true">
											<rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
											<rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
											<rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
											<rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
										</svg>
										{formData.mediaAssetId ? "Cambiar imagen" : "Elegir imagen"}
									</button>
								</div>

								<p className="text-body-sm text-text-secondary">
									{imageFile ? `Pendiente de subida: ${imageFile.name}` : selectedMedia ? selectedMedia.storageKey.split("/").pop() : "Sin imagen seleccionada"}
								</p>

								{(imageFile || formData.mediaAssetId) ? (
									<button type="button" onClick={() => clearImageSelection(true)} className="rounded-xl border border-border-default bg-surface-canvas px-4 py-2 text-label-md text-text-primary transition-[background-color,border-color,color] duration-[200ms] ease-soft hover:border-border-strong hover:bg-surface-soft active:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle">
										Quitar imagen
									</button>
								) : null}

								<MediaPickerModal
									open={pickerOpen}
									onClose={() => setPickerOpen(false)}
									onSelect={handlePickerSelect}
									uploadStorageKeyPrefix="Media/Categories"
								/>
							</div>

							<div className="space-y-2">
								<span className="block text-label-md text-text-primary">Previsualizacion</span>
								<MediaAssetFrame asset={previewAsset} label="Previsualizacion de imagen de categoria" minHeightClassName="min-h-[240px]" />
							</div>
						</div>

						<label className="flex items-center gap-3 rounded-2xl border border-[#c0d4be] bg-[#f8fbf7] px-4 py-3 text-body-sm text-text-secondary">
							<input type="checkbox" checked={formData.isActive} onChange={(event) => updateField("isActive", event.target.checked)} className="h-4 w-4 rounded border-border-default" />
							Categoria activa para seleccion publica
						</label>

						{errorMessage ? <p className="text-body-sm text-status-error">{errorMessage}</p> : null}

					</form>
				</section>

				<aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
					<section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
						<h2 className="text-section-lg text-text-primary">Estado de la ficha</h2>
		
						<div className="mt-5 space-y-2 text-body-sm leading-relaxed">
							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Guardado</span>
								<span className="text-label-md font-medium text-text-primary text-right leading-snug">{saveStatusLabel}</span>
							</div>
							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Modo</span>
								<span className="text-label-md font-medium text-text-primary text-right">{mode === "create" ? "Creación" : "Edición"}</span>
							</div>
							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Slug</span>
								<span className="text-label-md font-medium text-text-primary text-right break-words leading-snug">{formData.slug || "—"}</span>
							</div>
							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Href</span>
								<span className="text-label-md font-medium text-text-primary text-right break-words leading-snug">{formData.href || "—"}</span>
							</div>
							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Estado</span>
								<span className={cx("text-label-md font-medium", formData.isActive ? "text-emerald-700" : "text-text-secondary")}>
									{formData.isActive ? "Activa" : "Inactiva"}
								</span>
							</div>
						</div>

						<div className="mt-5 space-y-2 border-t border-border-soft pt-5">
							{errorMessage ? <p className="mb-2 text-body-sm text-status-error">{errorMessage}</p> : null}
							<button
								type="submit"
								form="category-form"
								disabled={submissionState === "saving"}
								className={`w-full ${ADMIN_BUTTON_PRIMARY_CLASS_NAME}`}
							>
								{submissionState === "saving" ? "Guardando..." : mode === "edit" ? "Actualizar categoria" : "Crear categoria"}
							</button>

							<Link href="/admin/catalog/categories" className={`w-full ${ADMIN_BUTTON_SECONDARY_CLASS_NAME}`}>
								Cancelar
							</Link>

							{mode === "edit" && category ? (
								<button type="button" onClick={handleDelete} className={`w-full ${ADMIN_BUTTON_DANGER_CLASS_NAME}`}>
									Eliminar categoria
								</button>
							) : null}
						</div>
					</section>
				</aside>
			</div>
		</div>
	);
}