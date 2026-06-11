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
import { ProductBadge } from "@/components/ui/product-badge";
import { SelectionCheckbox } from "@/features/admin-catalog/components/selection-checkbox";
import { cx } from "@/lib/utils";
import { DEFAULT_PRODUCT_BADGE_COLOR, PRODUCT_BADGE_PRESETS } from "@/lib/product-badges";
import { PRODUCT_BENEFIT_ICONS, DEFAULT_BENEFIT_ICON_KEY } from "@/lib/product-benefit-icons";
import {
	buildCatalogMediaStorageKey,
	buildProductHref,
	slugifyCatalogName,
} from "@/lib/catalog-slugs";
import { uploadMediaAsset } from "@/services/admin-content/client";
import {
	createProductClient,
	deleteProductClient,
	syncProductClient,
	updateProductClient,
} from "@/services/admin-catalog/client";
import type {
	AdminCatalogEditorData,
	AdminCatalogProductItem,
	AdminProductFormData,
	AdminProductSyncCapabilities,
	AdminProductSyncResult,
} from "@/types/admin-catalog";
import type { MediaAsset } from "@/types/media";

type SubmissionState = "idle" | "saving" | "success" | "error";

const adminFieldClassName = ADMIN_COMPACT_FIELD_CLASS_NAME;
const adminReadonlyFieldClassName = ADMIN_COMPACT_READONLY_FIELD_CLASS_NAME;

interface ProductAdminFormProps {
	initialData: AdminCatalogEditorData;
	mode: "create" | "edit";
	product?: AdminCatalogProductItem | null;
	syncCapabilities: AdminProductSyncCapabilities;
}

function buildProductForm(
	product?: AdminCatalogProductItem | null,
	categories: AdminCatalogEditorData["categories"] = [],
	brands: AdminCatalogEditorData["brands"] = [],
): AdminProductFormData {
	if (!product) {
		const defaultCategory = categories.find((category) => category.isActive) ?? categories[0];

		return {
			slug: "",
			name: "",
			brand: "Sin marca",
			brandId: brands[0]?.id ?? "",
			description: "",
			href: "",
			badge: "",
			badgeColor: "",
			price: 0,
			discountPrice: null,
			stock: 0,
			isActive: true,
			categoryId: defaultCategory?.id ?? "",
			categoryIds: defaultCategory ? [defaultCategory.id] : [],
			mediaAssetId: "",
			productColor: "",
			nutritionalInfoImageId: "",
			variants: [],
			ingredients: [],
			benefits: [],
			preTitle: "",
			shortDescription: "",
			longDescription: "",
			slogan: "",
			galleryImages: [],
			usageSteps: [],
			trustBadges: [],
			pickupLocationIds: [],
		};
	}

	return {
		slug: product.slug,
		name: product.name,
		brand: product.brand,
		brandId: product.brandId ?? brands[0]?.id ?? "",
		description: product.description,
		href: product.href,
		badge: product.badge ?? "",
		badgeColor: product.badgeColor ?? (product.badge ? DEFAULT_PRODUCT_BADGE_COLOR : ""),
		price: product.price,
		discountPrice: product.discountPrice,
		stock: product.stock,
		isActive: product.isActive,
		categoryId: product.categoryId ?? "",
		categoryIds: product.categoryIds,
		mediaAssetId: product.mediaAssetId ?? "",
		productColor: product.productColor ?? "",
		nutritionalInfoImageId: product.nutritionalInfoImageId ?? "",
		variants: product.variants.map((v) => ({
			id: v.id,
			name: v.name,
			price: v.price,
			discountPrice: v.discountPrice,
			stock: v.stock,
			isActive: v.isActive,
			sortOrder: v.sortOrder,
			mediaAssetId: v.mediaAssetId ?? "",
		})),
		ingredients: product.ingredients.map((ing) => ({
			id: ing.id,
			name: ing.name,
			description: ing.description ?? "",
			mediaAssetId: ing.mediaAssetId ?? "",
			sortOrder: ing.sortOrder,
		})),
		benefits: product.benefits.map((b) => ({
			id: b.id,
			text: b.text,
			iconKey: b.iconKey,
			sortOrder: b.sortOrder,
		})),
		preTitle: product.preTitle ?? "",
		shortDescription: product.shortDescription ?? "",
		longDescription: product.longDescription ?? "",
		slogan: product.slogan ?? "",
		galleryImages: product.galleryImages.map((g) => ({
			id: g.id,
			mediaAssetId: g.mediaAssetId,
			sortOrder: g.sortOrder,
		})),
		usageSteps: product.usageSteps.map((s) => ({
			id: s.id,
			stepNumber: s.stepNumber,
			text: s.text,
			mediaAssetId: s.mediaAssetId ?? "",
		})),
		trustBadges: product.trustBadges.map((b) => ({
			id: b.id,
			text: b.text,
			iconKey: b.iconKey,
			sortOrder: b.sortOrder,
		})),
		pickupLocationIds: product.pickupLocationIds,
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

function buildLocalPreviewAsset(input: {
	file: File | null;
	previewUrl: string | null;
	name: string;
}): MediaAsset | null {
	if (!input.file || !input.previewUrl) {
		return null;
	}

	return {
		id: "local-product-preview",
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

function mapProductItemToMediaAsset(product: AdminCatalogProductItem | null): MediaAsset | null {
	if (!product?.mediaAssetId || !product.mediaAssetPublicUrl) {
		return null;
	}

	return {
		id: product.mediaAssetId,
		kind: "image",
		url: product.mediaAssetPublicUrl,
		storageKey: null,
		altText: product.mediaAssetAltText,
		mimeType: null,
		posterUrl: null,
		width: null,
		height: null,
		durationSeconds: null,
	};
}

function formatDate(value: string | null): string {
	if (!value) {
		return "Sin sincronizacion";
	}

	return new Intl.DateTimeFormat("es-ES", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

const adminCurrencyFormatter = new Intl.NumberFormat("es-MX", {
	style: "currency",
	currency: "MXN",
	minimumFractionDigits: 2,
});

function formatCurrency(value: number | null | undefined): string {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return "Pendiente";
	}

	return adminCurrencyFormatter.format(value);
}

export function ProductAdminForm({ initialData, mode, product, syncCapabilities }: ProductAdminFormProps) {
	const router = useRouter();
	const badgePresetOptions =
		initialData.badgePresets.filter((preset) => preset.isActive).length > 0
			? initialData.badgePresets.filter((preset) => preset.isActive)
			: PRODUCT_BADGE_PRESETS.map((preset, index) => ({
				id: `fallback-${preset.label}`,
				label: preset.label,
				color: preset.color,
				isActive: true,
				sortOrder: index,
				createdAt: "",
				updatedAt: "",
			}));
	const [formData, setFormData] = useState<AdminProductFormData>(() =>
		buildProductForm(product, initialData.categories, initialData.brands),
	);
	const [persistedProduct, setPersistedProduct] = useState<AdminCatalogProductItem | null>(product ?? null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
	const [fileInputKey, setFileInputKey] = useState(0);
	const [pickerOpen, setPickerOpen] = useState(false);
	const [pickedAsset, setPickedAsset] = useState<AdminCatalogEditorData["mediaAssets"][number] | null>(null);
	const [categoryQuery, setCategoryQuery] = useState("");
	const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [syncState, setSyncState] = useState<SubmissionState>("idle");
	const [syncFeedback, setSyncFeedback] = useState<{
		tone: "success" | "error";
		message: string;
		details?: AdminProductSyncResult;
	} | null>(null);
	const [selectedSyncMode, setSelectedSyncMode] = useState(syncCapabilities.defaultMode);
	const [savedSnapshot, setSavedSnapshot] = useState(() =>
		JSON.stringify(buildProductForm(product, initialData.categories, initialData.brands)),
	);
	const [savedAt, setSavedAt] = useState<string | null>(product?.updatedAt ?? null);
	const selectedMedia = pickedAsset ?? initialData.mediaAssets.find((asset) => asset.id === formData.mediaAssetId) ?? null;
	const selectedBrand = initialData.brands.find((brand) => brand.id === formData.brandId) ?? null;
	const syncManagedSource = persistedProduct?.externalSourceId ?? null;
	const normalizedCategoryQuery = categoryQuery.trim().toLocaleLowerCase("es");
	const selectedCategories = formData.categoryIds
		.map((categoryId) => initialData.categories.find((category) => category.id === categoryId) ?? null)
		.filter((category): category is AdminCatalogEditorData["categories"][number] => Boolean(category));
	const filteredCategories = initialData.categories.filter((category) => {
		if (!normalizedCategoryQuery) {
			return true;
		}

		const searchTarget = `${category.name} ${category.slug} ${category.description}`.toLocaleLowerCase("es");
		return searchTarget.includes(normalizedCategoryQuery);
	});
	const previewAsset =
		buildLocalPreviewAsset({
			file: imageFile,
			previewUrl: imagePreviewUrl,
			name: formData.name,
		}) ?? mapMediaAssetSummaryToMediaAsset(selectedMedia) ?? mapProductItemToMediaAsset(persistedProduct);
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
							? "Listo para crear"
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
	const areInventoryFieldsSyncManaged = Boolean(syncManagedSource);
	const currentSyncHistory = persistedProduct?.syncHistory ?? product?.syncHistory ?? [];
	const selectedSyncModeOption = syncCapabilities.options.find((option) => option.mode === selectedSyncMode) ?? syncCapabilities.options[0];

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

	function updateVariantField<K extends keyof AdminProductFormData["variants"][number]>(index: number, key: K, value: AdminProductFormData["variants"][number][K]) {
		markAsDirty();
		setFormData((current) => {
			const next = current.variants.map((item, i) => (i === index ? { ...item, [key]: value } : item));
			return { ...current, variants: next };
		});
	}

	function updateIngredientField<K extends keyof AdminProductFormData["ingredients"][number]>(index: number, key: K, value: AdminProductFormData["ingredients"][number][K]) {
		markAsDirty();
		setFormData((current) => {
			const next = current.ingredients.map((item, i) => (i === index ? { ...item, [key]: value } : item));
			return { ...current, ingredients: next };
		});
	}

	function updateBenefitField<K extends keyof AdminProductFormData["benefits"][number]>(index: number, key: K, value: AdminProductFormData["benefits"][number][K]) {
		markAsDirty();
		setFormData((current) => {
			const next = current.benefits.map((item, i) => (i === index ? { ...item, [key]: value } : item));
			return { ...current, benefits: next };
		});
	}

	function updateGalleryField<K extends keyof AdminProductFormData["galleryImages"][number]>(index: number, key: K, value: AdminProductFormData["galleryImages"][number][K]) {
		markAsDirty();
		setFormData((current) => {
			const next = current.galleryImages.map((item, i) => (i === index ? { ...item, [key]: value } : item));
			return { ...current, galleryImages: next };
		});
	}

	function updateUsageStepField<K extends keyof AdminProductFormData["usageSteps"][number]>(index: number, key: K, value: AdminProductFormData["usageSteps"][number][K]) {
		markAsDirty();
		setFormData((current) => {
			const next = current.usageSteps.map((item, i) => (i === index ? { ...item, [key]: value } : item));
			return { ...current, usageSteps: next };
		});
	}

	function updateTrustBadgeField<K extends keyof AdminProductFormData["trustBadges"][number]>(index: number, key: K, value: AdminProductFormData["trustBadges"][number][K]) {
		markAsDirty();
		setFormData((current) => {
			const next = current.trustBadges.map((item, i) => (i === index ? { ...item, [key]: value } : item));
			return { ...current, trustBadges: next };
		});
	}

	function resetPendingImageSelection() {
		if (imagePreviewUrl) {
			URL.revokeObjectURL(imagePreviewUrl);
		}

		setImageFile(null);
		setImagePreviewUrl(null);
		setFileInputKey((current) => current + 1);
	}

	function updateField<Key extends keyof AdminProductFormData>(key: Key, value: AdminProductFormData[Key]) {
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
			href: slug ? buildProductHref(slug) : "",
		}));
	}

	function applyBadgePreset(label: string, color: string) {
		markAsDirty();
		setFormData((current) => ({
			...current,
			badge: label,
			badgeColor: color,
		}));
	}

	function clearBadge() {
		markAsDirty();
		setFormData((current) => ({
			...current,
			badge: "",
			badgeColor: "",
		}));
	}

	function updatePriceValue(value: string) {
		const normalizedValue = value.trim();
		if (normalizedValue.length === 0) {
			updateField("price", 0);
			return;
		}

		const nextValue = Number(normalizedValue);
		if (Number.isFinite(nextValue)) {
			updateField("price", nextValue);
		}
	}

	function updateDiscountPriceValue(value: string) {
		const normalizedValue = value.trim();
		if (normalizedValue.length === 0) {
			updateField("discountPrice", null);
			return;
		}

		const nextValue = Number(normalizedValue);
		if (Number.isFinite(nextValue)) {
			updateField("discountPrice", nextValue);
		}
	}

	function updateStockValue(value: string) {
		const normalizedValue = value.trim();
		if (normalizedValue.length === 0) {
			updateField("stock", 0);
			return;
		}

		const nextValue = Number.parseInt(normalizedValue, 10);
		if (Number.isFinite(nextValue)) {
			updateField("stock", nextValue);
		}
	}

	function toggleCategorySelection(categoryId: string) {
		markAsDirty();
		setFormData((current) => {
			const isSelected = current.categoryIds.includes(categoryId);
			const nextCategoryIds = isSelected
				? current.categoryIds.filter((value) => value !== categoryId)
				: [...current.categoryIds, categoryId];

			return {
				...current,
				categoryIds: nextCategoryIds,
				categoryId: nextCategoryIds[0] ?? "",
			};
		});
	}

	function updateBrandSelection(brandId: string) {
		const brand = initialData.brands.find((item) => item.id === brandId) ?? null;
		markAsDirty();
		setFormData((current) => ({
			...current,
			brandId,
			brand: brand?.name ?? current.brand,
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

	async function handleSyncProduct() {
		if (!persistedProduct) {
			return;
		}

		const selectedOption = syncCapabilities.options.find((option) => option.mode === selectedSyncMode);
		if (!selectedOption?.available) {
			setSyncState("error");
			setSyncFeedback({
				tone: "error",
				message: selectedOption?.description ?? "El modo de sync seleccionado no está disponible.",
			});
			return;
		}

		if (
			isDirty &&
			!window.confirm(
				"Hay cambios sin guardar. Si sincronizas ahora, el formulario se recargará con la versión guardada del producto y perderás esos cambios pendientes.",
			)
		) {
			return;
		}

		setSyncState("saving");
		setSyncFeedback(null);

		try {
			const result = await syncProductClient(persistedProduct.id, { mode: selectedSyncMode });
			const nextFormData = buildProductForm(result.product, initialData.categories, initialData.brands);

			setFormData(nextFormData);
			setPersistedProduct(result.product);
			setSavedSnapshot(JSON.stringify(nextFormData));
			setSavedAt(result.product.updatedAt);
			resetPendingImageSelection();
			setSubmissionState("success");
			setSyncState("success");
			setSyncFeedback({
				tone: "success",
				message: `${result.sync.isSimulation ? "Sincronización simulada" : "Sincronización real"} completada ${formatDate(result.sync.syncedAt).toLowerCase()}.`,
				details: result.sync,
			});
			router.refresh();
		} catch (error) {
			setSyncState("error");
			setSyncFeedback({
				tone: "error",
				message: error instanceof Error ? error.message : "No se pudo sincronizar el producto.",
			});
		}
	}

	async function uploadProductImage(file: File, name: string) {
		const slug = slugifyCatalogName(name);
		if (!slug) {
			throw new Error("El nombre es obligatorio para generar slug, href y la ruta de la imagen.");
		}

		const mediaAsset = await uploadMediaAsset(file, {
			storageKey: buildCatalogMediaStorageKey("products", slug, file.name),
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
			const payload: AdminProductFormData = {
				...formData,
				slug,
				href: slug ? buildProductHref(slug) : "",
				brand: selectedBrand?.name ?? formData.brand,
				categoryId: formData.categoryIds[0] ?? formData.categoryId,
				categoryIds: formData.categoryIds,
				mediaAssetId: formData.mediaAssetId,
			};

			if (imageFile) {
				payload.mediaAssetId = await uploadProductImage(imageFile, formData.name);
			}

			if (mode === "edit" && product) {
				const updated = await updateProductClient(product.id, payload);
				const nextFormData = buildProductForm(updated, initialData.categories, initialData.brands);
				setFormData(nextFormData);
				setPersistedProduct(updated);
				setSavedSnapshot(JSON.stringify(nextFormData));
				setSavedAt(updated.updatedAt);
				resetPendingImageSelection();
				setSubmissionState("success");
				router.refresh();
				return;
			}

			const created = await createProductClient(payload);
			router.push(`/admin/catalog/products/${created.id}`);
			router.refresh();
		} catch (error) {
			setSubmissionState("error");
			setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar el producto.");
		}
	}

	async function handleDelete() {
		if (!product) {
			return;
		}

		if (!window.confirm("Se eliminara el producto seleccionado. Esta accion no se puede deshacer.")) {
			return;
		}

		setSubmissionState("saving");
		setErrorMessage(null);

		try {
			await deleteProductClient(product.id);
			router.push("/admin/catalog/products");
			router.refresh();
		} catch (error) {
			setSubmissionState("error");
			setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar el producto.");
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
								{ label: "Catalogo", href: "/admin/catalog/products" },
								{ label: "Productos", href: "/admin/catalog/products" },
								{ label: mode === "create" ? "Nuevo" : formData.name || "Editar" },
							]}
						/>
						<p className="text-caption uppercase tracking-[0.14em] text-text-muted">Catalogo</p>
						<h1 className="text-section-lg text-text-primary sm:text-headline-sm">{mode === "create" ? "Nuevo producto" : "Editar producto"}</h1>
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
							<Link href="/admin/catalog/products" className="inline-flex min-h-10 items-center justify-center rounded-pill border border-border-default bg-surface-canvas px-4 py-2 text-center text-label-sm text-text-primary transition-[background-color,border-color,color] duration-[200ms] ease-soft hover:border-border-strong hover:bg-surface-soft active:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas">
								Volver al listado
							</Link>
							<Link href="/admin/catalog/products/new" className="inline-flex min-h-10 items-center justify-center rounded-pill bg-brand-primary px-4 py-2 text-center text-label-sm text-text-inverse shadow-sm transition-[background-color,border-color,color] duration-[200ms] ease-soft hover:bg-emerald-600 active:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas">
								Nuevo producto
							</Link>
						</div>
					</div>
				</div>
			</section>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_320px]">
				<section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
					<form id="product-form" onSubmit={handleSubmit} className="space-y-6">
						<div className="rounded-2xl bg-surface-subtle p-4">
							<div className="space-y-4">
								<label className="inline-flex items-center gap-3 text-body-sm text-text-secondary">
									<SelectionCheckbox
										checked={formData.isActive}
										onChange={() => updateField("isActive", !formData.isActive)}
										srLabel="Producto activo para seleccion publica"
									/>
									<span>Producto activo para seleccion publica</span>
								</label>

								<label className="space-y-2 block">
									<span className="block text-label-md text-text-primary">Nombre</span>
									<input value={formData.name} onChange={(event) => updateName(event.target.value)} className={ADMIN_COMPACT_PROMINENT_FIELD_CLASS_NAME} placeholder="Serum despigmentante" />
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
							<textarea value={formData.description} onChange={(event) => updateField("description", event.target.value)} rows={6} className={adminFieldClassName} />
						</label>

						<label className="space-y-2 block">
							<div className="flex items-center justify-between gap-3">
								<span className="block text-label-md text-text-primary">Marca</span>
								<Link href="/admin/catalog/brands" className="text-body-sm text-text-secondary underline-offset-4 hover:underline">
									Gestionar marcas
								</Link>
							</div>
							<select value={formData.brandId} onChange={(event) => updateBrandSelection(event.target.value)} className={adminFieldClassName}>
								<option value="">Selecciona una marca</option>
								{initialData.brands.map((brand) => (
									<option key={brand.id} value={brand.id}>
										{brand.name}
									</option>
								))}
							</select>
						</label>

						<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
							<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<span className="block text-label-md text-text-primary">Precio e inventario</span>
									<p className="text-body-sm text-text-secondary">
										{areInventoryFieldsSyncManaged
											? `Este producto está vinculado a ${syncManagedSource} y estos valores quedan bloqueados para evitar drift manual.`
											: "Estos valores son locales por ahora y podrán ser reemplazados por el sync externo en el futuro."}
									</p>
								</div>
								<span
									className={cx(
										"inline-flex w-fit rounded-full px-3 py-1 text-label-sm",
										areInventoryFieldsSyncManaged
											? "bg-amber-100 text-amber-900"
											: "bg-slate-100 text-slate-700",
									)}
								>
									{areInventoryFieldsSyncManaged ? "Gestionado por sync" : "Editable localmente"}
								</span>
							</div>

							<div className="grid gap-4 md:grid-cols-3">
							<label className="space-y-2 rounded-2xl border border-border-soft bg-surface-canvas p-4">
								<span className="block text-label-md text-text-primary">Precio regular</span>
								<input
									type="number"
									min="0"
									step="0.01"
									inputMode="decimal"
									value={formData.price ?? 0}
									onChange={(event) => updatePriceValue(event.target.value)}
									className={adminFieldClassName}
									placeholder="0.00"
									disabled={areInventoryFieldsSyncManaged}
								/>
								<p className="text-body-sm text-text-secondary">Valor local usado hoy por la tienda mientras no llegue desde la API externa.</p>
							</label>

							<label className="space-y-2 rounded-2xl border border-border-soft bg-surface-canvas p-4">
								<span className="block text-label-md text-text-primary">Precio oferta</span>
								<input
									type="number"
									min="0"
									step="0.01"
									inputMode="decimal"
									value={formData.discountPrice ?? ""}
									onChange={(event) => updateDiscountPriceValue(event.target.value)}
									className={adminFieldClassName}
									placeholder="Sin oferta"
									disabled={areInventoryFieldsSyncManaged}
								/>
								<p className="text-body-sm text-text-secondary">Déjalo vacío si no hay descuento activo.</p>
							</label>

							<label className="space-y-2 rounded-2xl border border-border-soft bg-surface-canvas p-4">
								<span className="block text-label-md text-text-primary">Stock</span>
								<input
									type="number"
									min="0"
									step="1"
									inputMode="numeric"
									value={formData.stock ?? 0}
									onChange={(event) => updateStockValue(event.target.value)}
									className={adminFieldClassName}
									placeholder="0"
									disabled={areInventoryFieldsSyncManaged}
								/>
								<p className="text-body-sm text-text-secondary">Existencia local editable. El sync futuro podrá actualizarla desde la API.</p>
							</label>
							</div>
						</div>

						<div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
							<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
								<div className="flex items-center justify-between gap-3">
									<span className="block text-label-md text-text-primary">Categorias</span>
									<span className="text-caption uppercase tracking-[0.12em] text-text-muted">La primera queda como principal</span>
								</div>
								<input
									value={categoryQuery}
									onChange={(event) => setCategoryQuery(event.target.value)}
									className={adminFieldClassName}
									placeholder="Busca categorias por nombre, slug o descripcion"
								/>

								{selectedCategories.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{selectedCategories.map((category, index) => (
											<button
												key={category.id}
												type="button"
												onClick={() => toggleCategorySelection(category.id)}
												className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface-canvas px-3 py-1.5 text-body-sm text-text-primary transition hover:border-border-brand"
											>
												<span>{category.name}</span>
												{index === 0 ? <span className="text-caption uppercase tracking-[0.12em] text-text-muted">Principal</span> : null}
											</button>
										))}
									</div>
								) : (
									<p className="text-body-sm text-text-secondary">Selecciona al menos una categoria para publicar el producto.</p>
								)}

								<div className="max-h-64 space-y-2 overflow-y-auto pr-1">
									{filteredCategories.length > 0 ? (
										filteredCategories.map((category) => {
											const isSelected = formData.categoryIds.includes(category.id);

											return (
												<button
													key={category.id}
													type="button"
													onClick={() => toggleCategorySelection(category.id)}
													className={cx(
														"flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
														isSelected
															? "border-border-brand bg-surface-canvas"
															: "border-border-soft bg-[#f8fbf7] hover:border-border-brand hover:bg-surface-canvas",
													)}
												>
													<SelectionCheckbox checked={isSelected} onChange={() => toggleCategorySelection(category.id)} srLabel={`Seleccionar categoria ${category.name}`} />
													<span className="min-w-0 flex-1 text-body-md text-text-primary">{category.name}</span>
												</button>
											);
										})
									) : (
										<p className="rounded-2xl border border-dashed border-border-soft px-4 py-5 text-body-sm text-text-secondary">No hay categorias que coincidan con la busqueda.</p>
									)}
								</div>
							</div>

							<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
								<div className="flex items-center justify-between gap-3">
									<span className="block text-label-md text-text-primary">Badge</span>
									{formData.badge ? (
										<button type="button" onClick={clearBadge} className="text-body-sm text-text-secondary underline-offset-4 hover:underline">
											Quitar
										</button>
									) : null}
								</div>
								<div className="flex flex-wrap gap-2">
									{badgePresetOptions.map((preset) => (
										<button
											key={preset.id}
											type="button"
											onClick={() => applyBadgePreset(preset.label, preset.color)}
											className="rounded-full border border-border-soft px-3 py-1.5 text-body-sm text-text-primary transition hover:border-border-brand hover:bg-surface-canvas"
										>
											{preset.label}
										</button>
									))}
								</div>
								<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_132px]">
									<label className="space-y-2">
										<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Texto</span>
										<input value={formData.badge} onChange={(event) => updateField("badge", event.target.value)} className={adminFieldClassName} placeholder="Escribe tu badge" />
									</label>
									<label className="space-y-2">
										<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Color</span>
										<input
											type="color"
											value={formData.badgeColor || DEFAULT_PRODUCT_BADGE_COLOR}
											onChange={(event) => updateField("badgeColor", event.target.value.toUpperCase())}
											className="h-[52px] w-full cursor-pointer rounded-xl border border-[#c0d4be] bg-[#f8fbf7] p-2"
											disabled={!formData.badge}
										/>
									</label>
								</div>
								{formData.badge ? (
									<div className="flex items-center gap-3">
										<span className="text-body-sm text-text-secondary">Vista previa</span>
										<ProductBadge label={formData.badge} color={formData.badgeColor || DEFAULT_PRODUCT_BADGE_COLOR} className="rounded-full border px-3 py-1" />
									</div>
								) : (
									<p className="text-body-sm text-text-secondary">Selecciona un preset o escribe un badge propio y asígnale color.</p>
								)}
							</div>
						</div>

						<div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
							<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
								<div className="space-y-2">
									<span className="block text-label-md text-text-primary">Imagen de producto</span>
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
									uploadStorageKeyPrefix="Media/Products"
								/>
							</div>

							<div className="space-y-2">
								<span className="block text-label-md text-text-primary">Previsualizacion</span>
								<MediaAssetFrame asset={previewAsset} label="Previsualizacion de imagen de producto" minHeightClassName="min-h-[240px]" />
							</div>
						</div>

						{/* ── Color de producto ───────────────────────────────── */}
						<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
							<span className="block text-label-md text-text-primary">Color de producto</span>
							<p className="text-body-sm text-text-secondary">Se usa para generar el gradiente de fondo en la pagina del producto.</p>
							<div className="flex items-center gap-4">
								<label className="space-y-2">
									<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Color</span>
									<input
										type="color"
										value={formData.productColor || "#E8D5B7"}
										onChange={(event) => updateField("productColor", event.target.value.toUpperCase())}
										className="h-[52px] w-full cursor-pointer rounded-xl border border-[#c0d4be] bg-[#f8fbf7] p-2"
									/>
								</label>
								{formData.productColor ? (
									<div className="flex items-center gap-3">
										<div className="h-10 w-24 rounded-xl border border-border-soft" style={{ background: `linear-gradient(135deg, ${formData.productColor}44, #FFF8F0)` }} />
										<button type="button" onClick={() => updateField("productColor", "")} className="text-body-sm text-text-secondary underline-offset-4 hover:underline">Quitar</button>
									</div>
								) : null}
							</div>
						</div>

						{/* ── Variantes / Presentaciones ─────────────────────── */}
						<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
							<div className="flex items-center justify-between gap-3">
								<div>
									<span className="block text-label-md text-text-primary">Presentaciones / Variantes</span>
									<p className="text-body-sm text-text-secondary">Si el producto tiene multiples tamanos o presentaciones, agregalas aqui. Cada una tiene su propio precio y stock.</p>
								</div>
								<button
									type="button"
								onClick={() => {
									markAsDirty();
									setFormData((current) => ({
										...current,
										variants: [...current.variants, { id: "", name: "", price: 0, discountPrice: null, stock: 0, isActive: true, sortOrder: current.variants.length, mediaAssetId: "" }],
									}));
								}}
									className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
								>
									+ Agregar presentacion
								</button>
							</div>
							{formData.variants.length > 0 ? (
								<div className="space-y-3">
									{formData.variants.map((variant, index) => (
										<div key={index} className="rounded-2xl border border-border-soft bg-surface-canvas p-4 space-y-3">
											<div className="flex items-center justify-between gap-3">
												<span className="text-label-md text-text-primary">Variante {index + 1}</span>
												<button
													type="button"
													onClick={() => {
														markAsDirty();
														setFormData((current) => ({
															...current,
															variants: current.variants.filter((_, i) => i !== index),
														}));
													}}
													className="text-body-sm text-status-error underline-offset-4 hover:underline"
												>
													Eliminar
												</button>
											</div>
											<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
												<label className="space-y-1">
													<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Nombre</span>
													<input
														value={variant.name}
													onChange={(event) => {
														updateVariantField(index, "name", event.target.value);
													}}
													className={adminFieldClassName}
													placeholder="30ml"
												/>
											</label>
											<label className="space-y-1">
												<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Precio</span>
												<input
													type="number"
													min="0"
													step="0.01"
													value={variant.price}
													onChange={(event) => {
														updateVariantField(index, "price", Number(event.target.value) || 0);
													}}
													className={adminFieldClassName}
												/>
											</label>
											<label className="space-y-1">
												<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Precio oferta</span>
												<input
													type="number"
													min="0"
													step="0.01"
													value={variant.discountPrice ?? ""}
													onChange={(event) => {
														updateVariantField(index, "discountPrice", event.target.value ? Number(event.target.value) : null);
													}}
													className={adminFieldClassName}
													placeholder="Sin oferta"
												/>
											</label>
											<label className="space-y-1">
												<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Stock</span>
												<input
													type="number"
													min="0"
													step="1"
													value={variant.stock}
													onChange={(event) => {
														updateVariantField(index, "stock", Number.parseInt(event.target.value, 10) || 0);
													}}
													className={adminFieldClassName}
												/>
												</label>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="rounded-2xl border border-dashed border-border-soft px-4 py-5 text-body-sm text-text-secondary">Sin variantes. El producto usa el precio y stock base.</p>
							)}
						</div>

						{/* ── Ingredientes ───────────────────────────────────── */}
						<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
							<div className="flex items-center justify-between gap-3">
								<div>
									<span className="block text-label-md text-text-primary">Ingredientes</span>
									<p className="text-body-sm text-text-secondary">Lista de ingredientes con imagen opcional.</p>
								</div>
								<button
									type="button"
								onClick={() => {
									markAsDirty();
									setFormData((current) => ({
										...current,
										ingredients: [...current.ingredients, { id: "", name: "", description: "", mediaAssetId: "", sortOrder: current.ingredients.length }],
									}));
								}}
									className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
								>
									+ Agregar ingrediente
								</button>
							</div>
							{formData.ingredients.length > 0 ? (
								<div className="space-y-3">
									{formData.ingredients.map((ingredient, index) => (
										<div key={index} className="rounded-2xl border border-border-soft bg-surface-canvas p-4 space-y-3">
											<div className="flex items-center justify-between gap-3">
												<span className="text-label-md text-text-primary">Ingrediente {index + 1}</span>
												<button
													type="button"
													onClick={() => {
														markAsDirty();
														setFormData((current) => ({
															...current,
															ingredients: current.ingredients.filter((_, i) => i !== index),
														}));
													}}
													className="text-body-sm text-status-error underline-offset-4 hover:underline"
												>
													Eliminar
												</button>
											</div>
											<div className="grid gap-3 sm:grid-cols-2">
												<label className="space-y-1">
													<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Nombre</span>
													<input
														value={ingredient.name}
												onChange={(event) => {
													updateIngredientField(index, "name", event.target.value);
												}}
												className={adminFieldClassName}
												placeholder="Vitamina C"
											/>
										</label>
										<label className="space-y-1">
											<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Imagen (opcional)</span>
											<input
												type="file"
												accept="image/*"
												onChange={async (event) => {
													const file = event.target.files?.[0];
													if (!file) return;
													try {
														const mediaAsset = await uploadMediaAsset(file, {
															storageKey: `Media/Products/ingredients/${Date.now()}-${file.name}`,
															kind: "image",
															altText: ingredient.name || file.name,
														});
														updateIngredientField(index, "mediaAssetId", mediaAsset.id);
													} catch (err) {
														setErrorMessage(err instanceof Error ? err.message : "Error al subir imagen");
													}
												}}
												className={adminFieldClassName}
											/>
										</label>
									</div>
									<label className="space-y-1 block">
										<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Descripcion</span>
										<textarea
											value={ingredient.description}
											onChange={(event) => {
												updateIngredientField(index, "description", event.target.value);
											}}
													rows={2}
													className={adminFieldClassName}
													placeholder="Extracto natural con propiedades antioxidantes..."
												/>
											</label>
										</div>
									))}
								</div>
							) : (
								<p className="rounded-2xl border border-dashed border-border-soft px-4 py-5 text-body-sm text-text-secondary">Sin ingredientes registrados.</p>
							)}
					</div>

					{/* ── Pretitulo, Slogan, Descripcion corta ──────────────── */}
					<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
						<span className="block text-label-md text-text-primary">Texto complementario</span>
						<div className="grid gap-3 sm:grid-cols-2">
							<label className="space-y-1">
								<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Pretitulo (eyebrow)</span>
								<input
									value={formData.preTitle}
									onChange={(event) => updateField("preTitle", event.target.value)}
									className={adminFieldClassName}
									placeholder="Nuevo lanzamiento"
								/>
							</label>
							<label className="space-y-1">
								<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Slogan</span>
								<input
									value={formData.slogan}
									onChange={(event) => updateField("slogan", event.target.value)}
									className={adminFieldClassName}
									placeholder="Tu piel merece lo mejor"
								/>
							</label>
						</div>
						<label className="space-y-1 block">
							<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Descripcion corta</span>
							<textarea
								value={formData.shortDescription}
								onChange={(event) => updateField("shortDescription", event.target.value)}
								rows={2}
								className={adminFieldClassName}
								placeholder="Resumen breve del producto para la ficha..."
							/>
						</label>
					</div>

					{/* ── Descripcion larga ──────────────────────────────────── */}
					<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
						<span className="block text-label-md text-text-primary">Descripcion larga (HTML)</span>
						<textarea
							value={formData.longDescription}
							onChange={(event) => updateField("longDescription", event.target.value)}
							rows={8}
							className={adminFieldClassName}
							placeholder="<p>Descripcion detallada del producto con <strong>formato HTML</strong>...</p>"
						/>
						<p className="text-body-sm text-text-secondary">Se renderiza como HTML en la pagina del producto.</p>
					</div>

					{/* ── Galeria de imagenes ────────────────────────────────── */}
					<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
						<div className="flex items-center justify-between gap-3">
							<div>
								<span className="block text-label-md text-text-primary">Galeria de imagenes</span>
								<p className="text-body-sm text-text-secondary">Imagenes adicionales del producto.</p>
							</div>
							<button
								type="button"
								onClick={() => {
									markAsDirty();
									setFormData((current) => ({
										...current,
										galleryImages: [...current.galleryImages, { id: "", mediaAssetId: "", sortOrder: current.galleryImages.length }],
									}));
								}}
								className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
							>
								+ Agregar imagen
							</button>
						</div>
						{formData.galleryImages.length > 0 ? (
							<div className="space-y-3">
								{formData.galleryImages.map((img, index) => (
									<div key={index} className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface-canvas p-4">
										<span className="text-label-md text-text-primary">{index + 1}</span>
										<button
											type="button"
											onClick={() => {
												const input = document.createElement("input");
												input.type = "file";
												input.accept = "image/*";
												input.onchange = async (e) => {
													const file = (e.target as HTMLInputElement).files?.[0];
													if (!file) return;
													try {
														const mediaAsset = await uploadMediaAsset(file, {
															storageKey: `Media/Products/gallery/${Date.now()}-${file.name}`,
															kind: "image",
															altText: formData.name || file.name,
														});
														updateGalleryField(index, "mediaAssetId", mediaAsset.id);
													} catch (err) {
														setErrorMessage(err instanceof Error ? err.message : "Error al subir imagen");
													}
												};
												input.click();
											}}
											className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
										>
											{img.mediaAssetId ? "Cambiar imagen" : "Subir imagen"}
										</button>
										<span className="text-body-sm text-text-secondary truncate flex-1">
											{img.mediaAssetId ? "Imagen seleccionada" : "Sin imagen"}
										</span>
										<button
											type="button"
											onClick={() => {
												markAsDirty();
												setFormData((current) => ({
													...current,
													galleryImages: current.galleryImages.filter((_, i) => i !== index),
												}));
											}}
											className="text-body-sm text-status-error underline-offset-4 hover:underline"
										>
											Eliminar
										</button>
									</div>
								))}
							</div>
						) : (
							<p className="rounded-2xl border border-dashed border-border-soft px-4 py-5 text-body-sm text-text-secondary">Sin imagenes en galeria.</p>
						)}
					</div>

					{/* ── Como usarlo ────────────────────────────────────────── */}
					<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
						<div className="flex items-center justify-between gap-3">
							<div>
								<span className="block text-label-md text-text-primary">Como usarlo</span>
								<p className="text-body-sm text-text-secondary">Pasos de uso del producto.</p>
							</div>
							<button
								type="button"
								onClick={() => {
									markAsDirty();
									setFormData((current) => ({
										...current,
										usageSteps: [...current.usageSteps, { id: "", stepNumber: current.usageSteps.length + 1, text: "", mediaAssetId: "" }],
									}));
								}}
								className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
							>
								+ Agregar paso
							</button>
						</div>
						{formData.usageSteps.length > 0 ? (
							<div className="space-y-3">
								{formData.usageSteps.map((step, index) => (
									<div key={index} className="rounded-2xl border border-border-soft bg-surface-canvas p-4 space-y-3">
										<div className="flex items-center justify-between gap-3">
											<span className="text-label-md text-text-primary">Paso {step.stepNumber}</span>
											<button
												type="button"
												onClick={() => {
													markAsDirty();
													setFormData((current) => ({
														...current,
														usageSteps: current.usageSteps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 })),
													}));
												}}
												className="text-body-sm text-status-error underline-offset-4 hover:underline"
											>
												Eliminar
											</button>
										</div>
										<label className="space-y-1 block">
											<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Instruccion</span>
											<textarea
												value={step.text}
												onChange={(event) => updateUsageStepField(index, "text", event.target.value)}
												rows={2}
												className={adminFieldClassName}
												placeholder="Aplica una cantidad generosa sobre el rostro limpio..."
											/>
										</label>
									</div>
								))}
							</div>
						) : (
							<p className="rounded-2xl border border-dashed border-border-soft px-4 py-5 text-body-sm text-text-secondary">Sin pasos de uso registrados.</p>
						)}
					</div>

					{/* ── Trust badges ──────────────────────────────────────── */}
					<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
						<div className="flex items-center justify-between gap-3">
							<div>
								<span className="block text-label-md text-text-primary">Trust badges</span>
								<p className="text-body-sm text-text-secondary">Senales de confianza personalizadas para este producto.</p>
							</div>
							<button
								type="button"
								onClick={() => {
									markAsDirty();
									setFormData((current) => ({
										...current,
										trustBadges: [...current.trustBadges, { id: "", text: "", iconKey: "check-circle", sortOrder: current.trustBadges.length }],
									}));
								}}
								className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
							>
								+ Agregar badge
							</button>
						</div>
						{formData.trustBadges.length > 0 ? (
							<div className="space-y-3">
								{formData.trustBadges.map((badge, index) => (
									<div key={index} className="rounded-2xl border border-border-soft bg-surface-canvas p-4 space-y-3">
										<div className="flex items-center justify-between gap-3">
											<span className="text-label-md text-text-primary">Badge {index + 1}</span>
											<button
												type="button"
												onClick={() => {
													markAsDirty();
													setFormData((current) => ({
														...current,
														trustBadges: current.trustBadges.filter((_, i) => i !== index),
													}));
												}}
												className="text-body-sm text-status-error underline-offset-4 hover:underline"
											>
												Eliminar
											</button>
										</div>
										<div className="grid gap-3 sm:grid-cols-2">
											<label className="space-y-1">
												<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Texto</span>
												<input
													value={badge.text}
													onChange={(event) => updateTrustBadgeField(index, "text", event.target.value)}
													className={adminFieldClassName}
													placeholder="Envio gratis a todo el pais"
												/>
											</label>
											<div className="space-y-1">
												<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Icono</span>
												<div className="grid grid-cols-6 gap-1.5">
													{PRODUCT_BENEFIT_ICONS.map((icon) => (
														<button
															key={icon.key}
															type="button"
															onClick={() => updateTrustBadgeField(index, "iconKey", icon.key)}
															className={[
																"flex items-center justify-center rounded-lg border p-1.5 transition",
																badge.iconKey === icon.key
																	? "border-brand-primary bg-emerald-50 text-brand-primary"
																	: "border-border-soft bg-surface-subtle text-text-muted hover:border-border-brand",
															].join(" ")}
															title={icon.label}
														>
															<svg viewBox={icon.viewBox} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
																{icon.paths.map((d, pi) => <path key={pi} d={d} />)}
															</svg>
														</button>
													))}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="rounded-2xl border border-dashed border-border-soft px-4 py-5 text-body-sm text-text-secondary">Sin trust badges personalizados. Se usaran los defaults del sistema.</p>
						)}
					</div>

					{/* ── Informacion nutricional ────────────────────────── */}
						<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
							<span className="block text-label-md text-text-primary">Informacion nutricional</span>
							<p className="text-body-sm text-text-secondary">Imagen con la tabla o informacion nutricional del producto.</p>
							<div className="flex items-center gap-4">
								<button
									type="button"
									onClick={() => {
										const input = document.createElement("input");
										input.type = "file";
										input.accept = "image/*";
										input.onchange = async (e) => {
											const file = (e.target as HTMLInputElement).files?.[0];
											if (!file) return;
											try {
												const mediaAsset = await uploadMediaAsset(file, {
													storageKey: `Media/Products/nutritional/${Date.now()}-${file.name}`,
													kind: "image",
													altText: `Informacion nutricional - ${formData.name}`,
												});
												markAsDirty();
												updateField("nutritionalInfoImageId", mediaAsset.id);
											} catch (err) {
												setErrorMessage(err instanceof Error ? err.message : "Error al subir imagen");
											}
										};
										input.click();
									}}
									className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
								>
									{formData.nutritionalInfoImageId ? "Cambiar imagen" : "Subir imagen"}
								</button>
								{formData.nutritionalInfoImageId ? (
									<button type="button" onClick={() => updateField("nutritionalInfoImageId", "")} className="text-body-sm text-status-error underline-offset-4 hover:underline">
										Quitar
									</button>
								) : null}
							</div>
						</div>

						{/* ── Beneficios ─────────────────────────────────────── */}
						<div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
							<div className="flex items-center justify-between gap-3">
								<div>
									<span className="block text-label-md text-text-primary">Beneficios</span>
									<p className="text-body-sm text-text-secondary">Beneficios clave del producto con icono.</p>
								</div>
								<button
									type="button"
								onClick={() => {
									markAsDirty();
									setFormData((current) => ({
										...current,
										benefits: [...current.benefits, { id: "", text: "", iconKey: DEFAULT_BENEFIT_ICON_KEY, sortOrder: current.benefits.length }],
									}));
								}}
									className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
								>
									+ Agregar beneficio
								</button>
							</div>
							{formData.benefits.length > 0 ? (
								<div className="space-y-3">
									{formData.benefits.map((benefit, index) => (
										<div key={index} className="rounded-2xl border border-border-soft bg-surface-canvas p-4 space-y-3">
											<div className="flex items-center justify-between gap-3">
												<span className="text-label-md text-text-primary">Beneficio {index + 1}</span>
												<button
													type="button"
													onClick={() => {
														markAsDirty();
														setFormData((current) => ({
															...current,
															benefits: current.benefits.filter((_, i) => i !== index),
														}));
													}}
													className="text-body-sm text-status-error underline-offset-4 hover:underline"
												>
													Eliminar
												</button>
											</div>
											<label className="space-y-1 block">
												<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Texto</span>
												<input
													value={benefit.text}
												onChange={(event) => {
													updateBenefitField(index, "text", event.target.value);
												}}
												className={adminFieldClassName}
												placeholder="Hidratacion profunda 24h"
											/>
										</label>
										<div className="space-y-2">
											<span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Icono</span>
											<div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-10">
												{PRODUCT_BENEFIT_ICONS.map((icon) => (
													<button
														key={icon.key}
														type="button"
														onClick={() => {
															updateBenefitField(index, "iconKey", icon.key);
														}}
															className={[
																"flex flex-col items-center gap-1 rounded-xl border p-2 transition",
																benefit.iconKey === icon.key
																	? "border-brand-primary bg-emerald-50 text-brand-primary"
																	: "border-border-soft bg-surface-subtle text-text-muted hover:border-border-brand",
															].join(" ")}
															title={icon.label}
														>
															<svg viewBox={icon.viewBox} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
																{icon.paths.map((d, pi) => <path key={pi} d={d} />)}
															</svg>
															<span className="text-[0.55rem] leading-tight text-center">{icon.label}</span>
														</button>
													))}
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="rounded-2xl border border-dashed border-border-soft px-4 py-5 text-body-sm text-text-secondary">Sin beneficios registrados.</p>
							)}
						</div>

					</form>
				</section>

				<aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
					<section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
						<h2 className="text-section-lg font-semibold text-text-primary">Estado del producto</h2>
						
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
								<span className="text-label-md font-medium text-text-primary text-right leading-snug">{formData.slug || "—"}</span>
							</div>
							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Href</span>
								<span className="text-label-md font-medium text-text-primary text-right break-words leading-snug">{formData.href || "—"}</span>
							</div>
							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Marca</span>
								<span className="text-label-md font-medium text-text-primary text-right leading-snug">{formData.brand || "—"}</span>
							</div>

							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Precio regular</span>
								<span className="text-label-md font-semibold text-text-primary">{formatCurrency(formData.price)}</span>
							</div>
							{formData.discountPrice ? (
								<div className="flex items-start justify-between gap-3">
									<span className="text-text-secondary whitespace-nowrap">Precio oferta</span>
									<span className="text-label-md font-semibold text-emerald-700">{formatCurrency(formData.discountPrice)}</span>
								</div>
							) : null}

							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Stock</span>
								<span className={cx("text-label-md font-semibold", formData.stock === 0 ? "text-status-error" : formData.stock === 1 ? "text-status-warning" : "text-text-primary")}>
									{formData.stock === 0 ? "Sin stock" : `${formData.stock} unidades`}
								</span>
							</div>

							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Categorías</span>
								<span className="text-label-md font-medium text-text-primary text-right break-words leading-snug">
									{selectedCategories.length > 0 ? selectedCategories.map((c) => c.name).join(", ") : "—"}
								</span>
							</div>
							
							{formData.badge ? (
								<div className="flex items-start justify-between gap-3">
									<span className="text-text-secondary whitespace-nowrap">Badge</span>
									<ProductBadge label={formData.badge} color={formData.badgeColor || DEFAULT_PRODUCT_BADGE_COLOR} className="rounded-full border px-2 py-0.5 text-xs" />
								</div>
							) : null}

							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Estado</span>
								<span className={cx("text-label-md font-medium", formData.isActive ? "text-emerald-700" : "text-text-secondary")}>
									{formData.isActive ? "Activo" : "Inactivo"}
								</span>
							</div>

							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Origen</span>
								<span className="text-label-md font-medium text-text-primary">
									{persistedProduct?.externalSourceId ? persistedProduct.externalSourceId : "Local"}
								</span>
							</div>

							{formData.productColor ? (
								<div className="flex items-start justify-between gap-3">
									<span className="text-text-secondary whitespace-nowrap">Color</span>
									<div className="flex items-center gap-2">
										<div className="h-4 w-4 rounded-full border border-border-soft" style={{ backgroundColor: formData.productColor }} />
										<span className="text-label-md font-medium text-text-primary">{formData.productColor}</span>
									</div>
								</div>
							) : null}

							{formData.variants.length > 0 ? (
								<div className="flex items-start justify-between gap-3">
									<span className="text-text-secondary whitespace-nowrap">Variantes</span>
									<span className="text-label-md font-medium text-text-primary">{formData.variants.length}</span>
								</div>
							) : null}

							{formData.ingredients.length > 0 ? (
								<div className="flex items-start justify-between gap-3">
									<span className="text-text-secondary whitespace-nowrap">Ingredientes</span>
									<span className="text-label-md font-medium text-text-primary">{formData.ingredients.length}</span>
								</div>
							) : null}

						{formData.benefits.length > 0 ? (
							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Beneficios</span>
								<span className="text-label-md font-medium text-text-primary">{formData.benefits.length}</span>
							</div>
						) : null}

						{formData.galleryImages.length > 0 ? (
							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Galeria</span>
								<span className="text-label-md font-medium text-text-primary">{formData.galleryImages.length} imagenes</span>
							</div>
						) : null}

						{formData.usageSteps.length > 0 ? (
							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Uso</span>
								<span className="text-label-md font-medium text-text-primary">{formData.usageSteps.length} pasos</span>
							</div>
						) : null}

						{formData.trustBadges.length > 0 ? (
							<div className="flex items-start justify-between gap-3">
								<span className="text-text-secondary whitespace-nowrap">Trust badges</span>
								<span className="text-label-md font-medium text-text-primary">{formData.trustBadges.length}</span>
							</div>
						) : null}
						</div>

						<div className="mt-5 space-y-2 border-t border-border-soft pt-5">
							{errorMessage ? <p className="mb-2 text-body-sm text-status-error">{errorMessage}</p> : null}
							{mode === "edit" && persistedProduct ? (
								<>
									<div className={`space-y-2 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
										<label className="space-y-2 block" htmlFor="product-sync-mode">
											<span className="block text-label-md text-text-primary">Modo de sync</span>
											<select
												id="product-sync-mode"
												value={selectedSyncMode}
												onChange={(event) => setSelectedSyncMode(event.target.value as typeof selectedSyncMode)}
												className={adminFieldClassName}
												disabled={syncState === "saving" || submissionState === "saving"}
											>
												{syncCapabilities.options.map((option) => (
													<option key={option.mode} value={option.mode} disabled={!option.available}>
														{option.label}{option.available ? "" : " (no disponible)"}
													</option>
												))}
											</select>
										</label>
										<p className="text-body-sm text-text-secondary">
											{selectedSyncModeOption?.description}
										</p>
									</div>
									<button
										type="button"
										onClick={handleSyncProduct}
										disabled={submissionState === "saving" || syncState === "saving"}
										className="inline-flex w-full min-h-11 items-center justify-center rounded-pill border border-amber-300 bg-amber-50 px-6 py-3 text-label-md text-amber-900 transition-[background-color,border-color,color] duration-[200ms] ease-soft hover:border-amber-400 hover:bg-amber-100 active:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas disabled:opacity-50"
									>
										{syncState === "saving" ? "Sincronizando..." : "Sincronizar este producto"}
									</button>
									<p className="text-body-sm text-text-secondary">
										Usa la ruta protegida del admin para sincronizar solo este producto. Puedes elegir simulación o proveedor real cuando esté configurado.
									</p>
									{syncFeedback ? (
										<p className={cx("text-body-sm", syncFeedback.tone === "success" ? "text-status-success" : "text-status-error")} role="status">
											{syncFeedback.message}
										</p>
									) : null}
								</>
							) : null}
							<button type="submit" form="product-form" disabled={submissionState === "saving"} className={`w-full ${ADMIN_BUTTON_PRIMARY_CLASS_NAME}`}>
								{submissionState === "saving" ? "Guardando..." : mode === "edit" ? "Actualizar producto" : "Crear producto"}
							</button>

							<Link href="/admin/catalog/products" className={`w-full ${ADMIN_BUTTON_SECONDARY_CLASS_NAME}`}>
								Cancelar
							</Link>

							{mode === "edit" && product ? (
								<button type="button" onClick={handleDelete} className={`w-full ${ADMIN_BUTTON_DANGER_CLASS_NAME}`}>
									Eliminar producto
								</button>
							) : null}
						</div>
					</section>

					{product ? (
						<>
							<section className="rounded-[28px] border border-border-soft bg-surface-canvas p-5 shadow-xs sm:p-6">
								<h2 className="text-section-lg text-text-primary">Historial de sync</h2>
								<div className="mt-4 space-y-3">
									{currentSyncHistory.length > 0 ? (
										currentSyncHistory.map((entry) => (
											<div key={`${entry.syncedAt}-${entry.mode}-${entry.sourceSystemId}`} className="rounded-2xl border border-border-soft bg-surface-subtle p-4 text-body-sm text-text-secondary">
												<div className="flex flex-wrap items-center gap-2">
													<span className={cx("inline-flex rounded-full px-2.5 py-0.5 text-label-sm", entry.isSimulation ? "bg-slate-100 text-slate-700" : "bg-emerald-100 text-emerald-800")}>
														{entry.isSimulation ? "Simulación" : "Real"}
													</span>
													<span className="font-medium text-text-primary">{entry.sourceSystemId}</span>
												</div>
												<p className="mt-2"><span className="text-text-primary">Fecha:</span> {formatDate(entry.syncedAt)}</p>
												<p><span className="text-text-primary">Precio:</span> {formatCurrency(entry.price)}</p>
												<p><span className="text-text-primary">Oferta:</span> {entry.discountPrice === null ? "Sin oferta" : formatCurrency(entry.discountPrice)}</p>
												<p><span className="text-text-primary">Stock:</span> {entry.stock} unidades</p>
											</div>
										))
									) : (
										<p className="rounded-2xl border border-dashed border-border-soft px-4 py-5 text-body-sm text-text-secondary">Aún no hay sincronizaciones registradas para este producto.</p>
									)}
								</div>
							</section>
						</>
					) : null}
				</aside>
			</div>
		</div>
	);
}