"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";

import { MediaAssetFrame } from "@/components/media/media-asset-frame";
import { ProductBadge } from "@/components/ui/product-badge";
import { cx } from "@/lib/utils";
import { DEFAULT_PRODUCT_BADGE_COLOR, PRODUCT_BADGE_PRESETS } from "@/lib/product-badges";
import { uploadMediaAsset } from "@/services/admin-content/client";
import {
  createCategoryClient,
  createProductClient,
  deleteCategoryClient,
  deleteProductClient,
  updateCategoryClient,
  updateProductClient,
} from "@/services/admin-catalog/client";
import {
  buildCatalogMediaStorageKey,
  buildCategoryHref,
  buildProductHref,
  slugifyCatalogName,
} from "@/lib/catalog-slugs";
import type {
  AdminCatalogCategoryItem,
  AdminCatalogEditorData,
  AdminCatalogProductItem,
  AdminCategoryFormData,
  AdminProductFormData,
} from "@/types/admin-catalog";
import type { MediaAsset } from "@/types/media";

type SubmissionState = "idle" | "saving" | "success" | "error";
type CatalogListFilter = "all" | "active" | "inactive";

interface CatalogAdminPanelProps {
  initialData: AdminCatalogEditorData;
  section: "categories" | "products";
}

function sortCategories(categories: AdminCatalogCategoryItem[]) {
  return [...categories].sort((left, right) => {
    if (left.isActive !== right.isActive) {
      return left.isActive ? -1 : 1;
    }

    return left.name.localeCompare(right.name, "es");
  });
}

function sortProducts(products: AdminCatalogProductItem[]) {
  return [...products].sort((left, right) => {
    if (left.isActive !== right.isActive) {
      return left.isActive ? -1 : 1;
    }

    return left.name.localeCompare(right.name, "es");
  });
}

function sortMediaAssets(mediaAssets: AdminCatalogEditorData["mediaAssets"]) {
  return [...mediaAssets].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
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
  id: string;
  file: File | null;
  previewUrl: string | null;
  name: string;
}): MediaAsset | null {
  if (!input.file || !input.previewUrl) {
    return null;
  }

  return {
    id: input.id,
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

function matchesCatalogFilter(isActive: boolean, filter: CatalogListFilter): boolean {
  if (filter === "all") {
    return true;
  }

  return filter === "active" ? isActive : !isActive;
}

function matchesSearchableText(searchText: string, query: string): boolean {
  if (!query) {
    return true;
  }

  return searchText.includes(query);
}

function buildEmptyCategoryForm(): AdminCategoryFormData {
  return {
    slug: "",
    name: "",
    description: "",
    href: "",
    isActive: true,
    mediaAssetId: "",
  };
}

function buildEmptyProductForm(): AdminProductFormData {
  const defaultCategoryId = "";

  return {
    slug: "",
    name: "",
    brand: "Sin marca",
    brandId: "",
    description: "",
    href: "",
    badge: "",
    badgeColor: "",
    isActive: true,
    categoryId: defaultCategoryId,
    categoryIds: defaultCategoryId ? [defaultCategoryId] : [],
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getMediaAssetLabel(
  mediaAssets: CatalogAdminPanelProps["initialData"]["mediaAssets"],
  mediaAssetId: string | null,
): string {
  if (!mediaAssetId) {
    return "Sin media asset";
  }

  const mediaAsset = mediaAssets.find((item) => item.id === mediaAssetId);
  return mediaAsset ? mediaAsset.storageKey : "Media asset no encontrada";
}

export function CatalogAdminPanel({ initialData, section }: CatalogAdminPanelProps) {
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
  const [categories, setCategories] = useState(sortCategories(initialData.categories));
  const [products, setProducts] = useState(sortProducts(initialData.products));
  const [mediaAssets, setMediaAssets] = useState(sortMediaAssets(initialData.mediaAssets));
  const [categoryForm, setCategoryForm] = useState<AdminCategoryFormData>(buildEmptyCategoryForm());
  const [productForm, setProductForm] = useState<AdminProductFormData>(buildEmptyProductForm());
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [categoryImagePreviewUrl, setCategoryImagePreviewUrl] = useState<string | null>(null);
  const [productImagePreviewUrl, setProductImagePreviewUrl] = useState<string | null>(null);
  const [categoryFileInputKey, setCategoryFileInputKey] = useState(0);
  const [productFileInputKey, setProductFileInputKey] = useState(0);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CatalogListFilter>("all");
  const [productFilter, setProductFilter] = useState<CatalogListFilter>("all");
  const [categorySubmissionState, setCategorySubmissionState] = useState<SubmissionState>("idle");
  const [productSubmissionState, setProductSubmissionState] = useState<SubmissionState>("idle");
  const [categoryMessage, setCategoryMessage] = useState<string | null>(null);
  const [productMessage, setProductMessage] = useState<string | null>(null);
  const [categoryErrorMessage, setCategoryErrorMessage] = useState<string | null>(null);
  const [productErrorMessage, setProductErrorMessage] = useState<string | null>(null);

  const deferredCategorySearchQuery = useDeferredValue(categorySearchQuery.trim().toLocaleLowerCase("es"));
  const deferredProductSearchQuery = useDeferredValue(productSearchQuery.trim().toLocaleLowerCase("es"));

  const selectedCategoryMedia = mediaAssets.find((asset) => asset.id === categoryForm.mediaAssetId) ?? null;
  const selectedProductMedia = mediaAssets.find((asset) => asset.id === productForm.mediaAssetId) ?? null;
  const showCategories = section === "categories";
  const showProducts = section === "products";
  const categoryPreviewAsset =
    buildLocalPreviewAsset({
      id: "local-category-preview",
      file: categoryImageFile,
      previewUrl: categoryImagePreviewUrl,
      name: categoryForm.name,
    }) ?? mapMediaAssetSummaryToMediaAsset(selectedCategoryMedia);
  const productPreviewAsset =
    buildLocalPreviewAsset({
      id: "local-product-preview",
      file: productImageFile,
      previewUrl: productImagePreviewUrl,
      name: productForm.name,
    }) ?? mapMediaAssetSummaryToMediaAsset(selectedProductMedia);

  const filteredCategories = categories.filter((category) => {
    const searchText = [category.name, category.slug, category.description, category.href]
      .join(" ")
      .toLocaleLowerCase("es");

    return (
      matchesCatalogFilter(category.isActive, categoryFilter) &&
      matchesSearchableText(searchText, deferredCategorySearchQuery)
    );
  });

  const filteredProducts = products.filter((product) => {
    const searchText = [
      product.name,
      product.slug,
      product.description,
      product.href,
      product.badge ?? "",
      product.externalSourceId ?? "",
    ]
      .join(" ")
      .toLocaleLowerCase("es");

    return (
      matchesCatalogFilter(product.isActive, productFilter) &&
      matchesSearchableText(searchText, deferredProductSearchQuery)
    );
  });

  const activeCategoryCount = categories.filter((category) => category.isActive).length;
  const inactiveCategoryCount = categories.length - activeCategoryCount;
  const activeProductCount = products.filter((product) => product.isActive).length;
  const inactiveProductCount = products.length - activeProductCount;
  const editingCategory = editingCategoryId
    ? categories.find((category) => category.id === editingCategoryId) ?? null
    : null;
  const editingProduct = editingProductId
    ? products.find((product) => product.id === editingProductId) ?? null
    : null;

  useEffect(() => {
    return () => {
      if (categoryImagePreviewUrl) {
        URL.revokeObjectURL(categoryImagePreviewUrl);
      }

      if (productImagePreviewUrl) {
        URL.revokeObjectURL(productImagePreviewUrl);
      }
    };
  }, [categoryImagePreviewUrl, productImagePreviewUrl]);

  function updateCategoryField<Key extends keyof AdminCategoryFormData>(
    key: Key,
    value: AdminCategoryFormData[Key],
  ) {
    setCategoryForm((current) => ({ ...current, [key]: value }));
  }

  function updateCategoryName(name: string) {
    const slug = slugifyCatalogName(name);
    updateCategoryField("name", name);
    updateCategoryField("slug", slug);
    updateCategoryField("href", slug ? buildCategoryHref(slug) : "");
  }

  function updateProductField<Key extends keyof AdminProductFormData>(
    key: Key,
    value: AdminProductFormData[Key],
  ) {
    setProductForm((current) => ({ ...current, [key]: value }));
  }

  function updateProductName(name: string) {
    const slug = slugifyCatalogName(name);
    updateProductField("name", name);
    updateProductField("slug", slug);
    updateProductField("href", slug ? buildProductHref(slug) : "");
  }

  function applyProductBadgePreset(label: string, color: string) {
    setProductForm((current) => ({
      ...current,
      badge: label,
      badgeColor: color,
    }));
  }

  function clearProductBadge() {
    setProductForm((current) => ({
      ...current,
      badge: "",
      badgeColor: "",
    }));
  }

  function appendMediaAsset(mediaAsset: AdminCatalogEditorData["mediaAssets"][number]) {
    setMediaAssets((current) =>
      sortMediaAssets([mediaAsset, ...current.filter((item) => item.id !== mediaAsset.id)]),
    );
  }

  function clearCategoryImageSelection() {
    if (categoryImagePreviewUrl) {
      URL.revokeObjectURL(categoryImagePreviewUrl);
    }

    setCategoryImageFile(null);
    setCategoryImagePreviewUrl(null);
    setCategoryFileInputKey((current) => current + 1);
  }

  function clearProductImageSelection() {
    if (productImagePreviewUrl) {
      URL.revokeObjectURL(productImagePreviewUrl);
    }

    setProductImageFile(null);
    setProductImagePreviewUrl(null);
    setProductFileInputKey((current) => current + 1);
  }

  function handleCategoryImageChange(file: File | null) {
    if (categoryImagePreviewUrl) {
      URL.revokeObjectURL(categoryImagePreviewUrl);
    }

    setCategoryImageFile(file);
    setCategoryImagePreviewUrl(file ? URL.createObjectURL(file) : null);
    setCategoryErrorMessage(null);
    setCategoryMessage(null);
  }

  function handleProductImageChange(file: File | null) {
    if (productImagePreviewUrl) {
      URL.revokeObjectURL(productImagePreviewUrl);
    }

    setProductImageFile(file);
    setProductImagePreviewUrl(file ? URL.createObjectURL(file) : null);
    setProductErrorMessage(null);
    setProductMessage(null);
  }

  async function uploadCatalogImage(input: {
    file: File;
    entityType: "categories" | "products";
    name: string;
  }) {
    const slug = slugifyCatalogName(input.name);
    if (!slug) {
      throw new Error("El nombre es obligatorio para generar slug, href y la ruta de la imagen.");
    }

    const mediaAsset = await uploadMediaAsset(input.file, {
      storageKey: buildCatalogMediaStorageKey(input.entityType, slug, input.file.name),
      kind: "image",
      altText: input.name.trim(),
    });

    appendMediaAsset(mediaAsset);
    return mediaAsset.id;
  }

  function resetCategoryForm() {
    setEditingCategoryId(null);
    setCategoryForm(buildEmptyCategoryForm());
    clearCategoryImageSelection();
    setCategorySubmissionState("idle");
    setCategoryMessage(null);
    setCategoryErrorMessage(null);
  }

  function resetProductForm() {
    setEditingProductId(null);
    setProductForm(buildEmptyProductForm());
    clearProductImageSelection();
    setProductSubmissionState("idle");
    setProductMessage(null);
    setProductErrorMessage(null);
  }

  function startEditCategory(category: AdminCatalogCategoryItem) {
    setEditingCategoryId(category.id);
    clearCategoryImageSelection();
    setCategoryForm({
      slug: category.slug,
      name: category.name,
      description: category.description,
      href: category.href,
      isActive: category.isActive,
      mediaAssetId: category.mediaAssetId ?? "",
    });
    setCategorySubmissionState("idle");
    setCategoryMessage(null);
    setCategoryErrorMessage(null);
  }

  function startEditProduct(product: AdminCatalogProductItem) {
    setEditingProductId(product.id);
    clearProductImageSelection();
    setProductForm({
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      brandId: product.brandId ?? "",
      description: product.description,
      href: product.href,
      badge: product.badge ?? "",
      badgeColor: product.badgeColor ?? (product.badge ? DEFAULT_PRODUCT_BADGE_COLOR : ""),
      isActive: product.isActive,
      categoryId: product.categoryId ?? "",
      categoryIds: product.categoryIds,
      mediaAssetId: product.mediaAssetId ?? "",
      productColor: product.productColor ?? "",
      nutritionalInfoImageId: product.nutritionalInfoImageId ?? "",
      variants: product.variants.map((v) => ({ id: v.id, name: v.name, price: v.price, discountPrice: v.discountPrice, stock: v.stock, isActive: v.isActive, sortOrder: v.sortOrder, mediaAssetId: v.mediaAssetId ?? "" })),
      ingredients: product.ingredients.map((ing) => ({ id: ing.id, name: ing.name, description: ing.description ?? "", mediaAssetId: ing.mediaAssetId ?? "", sortOrder: ing.sortOrder })),
      benefits: product.benefits.map((b) => ({ id: b.id, text: b.text, iconKey: b.iconKey, sortOrder: b.sortOrder })),
      preTitle: product.preTitle ?? "",
      shortDescription: product.shortDescription ?? "",
      longDescription: product.longDescription ?? "",
      slogan: product.slogan ?? "",
      galleryImages: product.galleryImages.map((g) => ({ id: g.id, mediaAssetId: g.mediaAssetId, sortOrder: g.sortOrder })),
      usageSteps: product.usageSteps.map((s) => ({ id: s.id, stepNumber: s.stepNumber, text: s.text, mediaAssetId: s.mediaAssetId ?? "" })),
      trustBadges: product.trustBadges.map((b) => ({ id: b.id, text: b.text, iconKey: b.iconKey, sortOrder: b.sortOrder })),
      pickupLocationIds: product.pickupLocationIds,
    });
    setProductSubmissionState("idle");
    setProductMessage(null);
    setProductErrorMessage(null);
  }

  async function handleCategorySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCategorySubmissionState("saving");
    setCategoryMessage(null);
    setCategoryErrorMessage(null);

    startTransition(() => {
      void (async () => {
        const slug = slugifyCatalogName(categoryForm.name);
        const payload: AdminCategoryFormData = {
          ...categoryForm,
          slug,
          href: slug ? buildCategoryHref(slug) : "",
          mediaAssetId: categoryForm.mediaAssetId,
        };

        if (categoryImageFile) {
          payload.mediaAssetId = await uploadCatalogImage({
            file: categoryImageFile,
            entityType: "categories",
            name: categoryForm.name,
          });
        }

        const category = editingCategoryId
          ? await updateCategoryClient(editingCategoryId, payload)
          : await createCategoryClient(payload);

        setCategories((current) =>
          sortCategories([
            category,
            ...current.filter((item) => item.id !== category.id),
          ]),
        );
        setCategorySubmissionState("success");
        setCategoryMessage(editingCategoryId ? "Categoría actualizada correctamente." : "Categoría creada correctamente.");
        setEditingCategoryId(null);
        setCategoryForm(buildEmptyCategoryForm());
        clearCategoryImageSelection();
      })().catch((error) => {
        setCategorySubmissionState("error");
        setCategoryErrorMessage(error instanceof Error ? error.message : "No se pudo guardar la categoría.");
      });
    });
  }

  async function handleProductSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductSubmissionState("saving");
    setProductMessage(null);
    setProductErrorMessage(null);

    startTransition(() => {
      void (async () => {
        const slug = slugifyCatalogName(productForm.name);
        const payload: AdminProductFormData = {
          ...productForm,
          slug,
          href: slug ? buildProductHref(slug) : "",
          categoryId: productForm.categoryIds[0] ?? productForm.categoryId,
          categoryIds: productForm.categoryIds.length > 0 ? productForm.categoryIds : productForm.categoryId ? [productForm.categoryId] : [],
          mediaAssetId: productForm.mediaAssetId,
        };

        if (productImageFile) {
          payload.mediaAssetId = await uploadCatalogImage({
            file: productImageFile,
            entityType: "products",
            name: productForm.name,
          });
        }

        const product = editingProductId
          ? await updateProductClient(editingProductId, payload)
          : await createProductClient(payload);

        setProducts((current) =>
          sortProducts([
            product,
            ...current.filter((item) => item.id !== product.id),
          ]),
        );
        setProductSubmissionState("success");
        setProductMessage(editingProductId ? "Producto actualizado correctamente." : "Producto creado correctamente.");
        setEditingProductId(null);
        setProductForm(buildEmptyProductForm());
        clearProductImageSelection();
      })().catch((error) => {
        setProductSubmissionState("error");
        setProductErrorMessage(error instanceof Error ? error.message : "No se pudo guardar el producto.");
      });
    });
  }

  function handleDeleteCategory(id: string) {
    if (!window.confirm("Se eliminará la categoría seleccionada. Esta acción no se puede deshacer.")) {
      return;
    }

    setCategorySubmissionState("saving");
    setCategoryMessage(null);
    setCategoryErrorMessage(null);

    startTransition(() => {
      void deleteCategoryClient(id)
        .then((deletedId) => {
          setCategories((current) => current.filter((item) => item.id !== deletedId));
          if (editingCategoryId === deletedId) {
            resetCategoryForm();
          }
          setCategorySubmissionState("success");
          setCategoryMessage("Categoría eliminada correctamente.");
        })
        .catch((error) => {
          setCategorySubmissionState("error");
          setCategoryErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar la categoría.");
        });
    });
  }

  function handleDeleteProduct(id: string) {
    if (!window.confirm("Se eliminará el producto seleccionado. Esta acción no se puede deshacer.")) {
      return;
    }

    setProductSubmissionState("saving");
    setProductMessage(null);
    setProductErrorMessage(null);

    startTransition(() => {
      void deleteProductClient(id)
        .then((deletedId) => {
          setProducts((current) => current.filter((item) => item.id !== deletedId));
          if (editingProductId === deletedId) {
            resetProductForm();
          }
          setProductSubmissionState("success");
          setProductMessage("Producto eliminado correctamente.");
        })
        .catch((error) => {
          setProductSubmissionState("error");
          setProductErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar el producto.");
        });
    });
  }

  return (
    <div className="space-y-8">
      {showCategories ? (
        <div className="grid gap-6 2xl:grid-cols-[minmax(340px,460px)_minmax(0,1fr)]">
          <section className="space-y-4 rounded-[28px] border border-border-soft bg-surface-canvas p-4 shadow-xs sm:p-5">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Biblioteca</p>
                  <h2 className="text-section-lg text-text-primary">Categorías</h2>
                  <p className="text-body-sm text-text-secondary">
                    Explora, filtra y selecciona la categoría que quieras editar desde una vista operativa tipo catálogo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="rounded-xl border border-border-default px-4 py-2 text-label-md text-text-primary"
                >
                  Nueva
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border-soft bg-surface-subtle p-4">
                  <p className="text-caption uppercase tracking-[0.12em] text-text-muted">Total</p>
                  <p className="mt-2 text-headline-sm text-text-primary">{categories.length}</p>
                  <p className="text-body-sm text-text-secondary">categorías registradas</p>
                </div>
                <div className="rounded-2xl border border-border-soft bg-surface-subtle p-4">
                  <p className="text-caption uppercase tracking-[0.12em] text-text-muted">Activas</p>
                  <p className="mt-2 text-headline-sm text-text-primary">{activeCategoryCount}</p>
                  <p className="text-body-sm text-text-secondary">visibles para selección pública</p>
                </div>
                <div className="rounded-2xl border border-border-soft bg-surface-subtle p-4">
                  <p className="text-caption uppercase tracking-[0.12em] text-text-muted">Inactivas</p>
                  <p className="mt-2 text-headline-sm text-text-primary">{inactiveCategoryCount}</p>
                  <p className="text-body-sm text-text-secondary">en reserva editorial</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-border-soft bg-surface-subtle p-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <label className="space-y-2">
                <span className="block text-label-md text-text-primary">Buscar categorías</span>
                <input
                  value={categorySearchQuery}
                  onChange={(event) => setCategorySearchQuery(event.target.value)}
                  className="w-full rounded-xl border border-border-default bg-surface-canvas px-4 py-3 text-body-md text-text-primary"
                  placeholder="Nombre, slug, descripción o href"
                />
              </label>

              <label className="space-y-2">
                <span className="block text-label-md text-text-primary">Estado</span>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value as CatalogListFilter)}
                  className="w-full rounded-xl border border-border-default bg-surface-canvas px-4 py-3 text-body-md text-text-primary"
                >
                  <option value="all">Todas</option>
                  <option value="active">Solo activas</option>
                  <option value="inactive">Solo inactivas</option>
                </select>
              </label>
            </div>

            <p className="text-body-sm text-text-secondary">
              Mostrando {filteredCategories.length} de {categories.length} categorías.
            </p>

            {filteredCategories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-soft bg-surface-subtle p-6 text-body-sm text-text-secondary">
                No hay categorías que coincidan con los filtros actuales.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCategories.map((category) => {
                  const isEditing = editingCategoryId === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => startEditCategory(category)}
                      className={cx(
                        "w-full rounded-2xl border p-4 text-left transition-colors",
                        isEditing
                          ? "border-border-brand bg-surface-brandTint shadow-sm"
                          : "border-border-soft bg-surface-subtle hover:border-border-default hover:bg-surface-canvas",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-label-lg text-text-primary">{category.name}</p>
                            <span
                              className={cx(
                                "rounded-full border px-2.5 py-1 text-caption uppercase tracking-[0.12em]",
                                category.isActive
                                  ? "border-border-brand bg-surface-canvas text-text-brand"
                                  : "border-border-soft text-text-muted",
                              )}
                            >
                              {category.isActive ? "Activa" : "Inactiva"}
                            </span>
                          </div>

                          <p className="text-body-sm text-text-secondary">{category.href}</p>
                          <p className="text-body-sm text-text-secondary">{category.description}</p>
                        </div>

                        <span className="rounded-full border border-border-soft px-2.5 py-1 text-caption uppercase tracking-[0.12em] text-text-muted">
                          {isEditing ? "Editando" : "Abrir"}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-body-sm text-text-secondary">
                        <span>{getMediaAssetLabel(mediaAssets, category.mediaAssetId)}</span>
                        <span>Actualizada: {formatDate(category.updatedAt)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-border-soft bg-surface-canvas p-5 shadow-xs sm:p-6 2xl:sticky 2xl:top-6">
            <div className="flex items-start justify-between gap-4 border-b border-border-soft pb-5">
              <div className="space-y-2">
                <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Editor</p>
                <h2 className="text-section-lg text-text-primary">
                  {editingCategoryId ? "Editar categoría" : "Nueva categoría"}
                </h2>
                <p className="text-body-sm text-text-secondary">
                  {editingCategory
                    ? `Última actualización: ${formatDate(editingCategory.updatedAt)}`
                    : "Completa la ficha y guarda sin salir de la vista de catálogo."}
                </p>
              </div>

              {(editingCategoryId || categoryForm.name || categoryForm.description || categoryImageFile) ? (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="rounded-xl border border-border-default px-4 py-2 text-label-md text-text-primary"
                >
                  Limpiar
                </button>
              ) : null}
            </div>

            <form onSubmit={handleCategorySubmit} className="mt-6 space-y-6">
              <div className="rounded-2xl border border-border-soft bg-surface-subtle p-4">
                <p className="text-label-md text-text-primary">Identidad pública</p>
                <p className="mt-1 text-body-sm text-text-secondary">
                  Slug y href se derivan automáticamente desde el nombre para evitar inconsistencias editoriales.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="block text-label-md text-text-primary">Nombre</span>
                    <input
                      value={categoryForm.name}
                      onChange={(event) => updateCategoryName(event.target.value)}
                      className="w-full rounded-xl border border-border-default bg-surface-canvas px-4 py-3 text-body-md text-text-primary"
                      placeholder="Dermocosmética"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="block text-label-md text-text-primary">Slug</span>
                      <input
                        value={categoryForm.slug}
                        readOnly
                        className="w-full rounded-xl border border-border-soft bg-surface-canvas px-4 py-3 text-body-md text-text-secondary"
                        placeholder="Se genera desde el nombre"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="block text-label-md text-text-primary">Href</span>
                      <input
                        value={categoryForm.href}
                        readOnly
                        className="w-full rounded-xl border border-border-soft bg-surface-canvas px-4 py-3 text-body-md text-text-secondary"
                        placeholder="Se genera automáticamente"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Descripción</span>
                <textarea
                  value={categoryForm.description}
                  onChange={(event) => updateCategoryField("description", event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-border-default bg-surface-canvas px-4 py-3 text-body-md text-text-primary"
                />
              </label>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
                <div className="space-y-3 rounded-2xl border border-border-soft bg-surface-subtle p-4">
                  <div className="space-y-2">
                    <span className="block text-label-md text-text-primary">Imagen de categoría</span>
                    <input
                      key={categoryFileInputKey}
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleCategoryImageChange(event.target.files?.[0] ?? null)}
                      className="w-full rounded-xl border border-border-default bg-surface-canvas px-4 py-3 text-body-md text-text-primary"
                    />
                  </div>

                  <p className="text-body-sm text-text-secondary">
                    {categoryImageFile
                      ? `Pendiente de subida: ${categoryImageFile.name}`
                      : `Imagen actual: ${getMediaAssetLabel(mediaAssets, categoryForm.mediaAssetId || null)}`}
                  </p>

                  {(categoryImageFile || categoryForm.mediaAssetId) ? (
                    <button
                      type="button"
                      onClick={() => {
                        clearCategoryImageSelection();
                        updateCategoryField("mediaAssetId", "");
                      }}
                      className="rounded-xl border border-border-default px-4 py-2 text-label-md text-text-primary"
                    >
                      Quitar imagen
                    </button>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <span className="block text-label-md text-text-primary">Previsualización</span>
                  <MediaAssetFrame
                    asset={categoryPreviewAsset}
                    label="Previsualización de imagen de categoría"
                    minHeightClassName="min-h-[220px]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface-subtle px-4 py-3 text-body-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={categoryForm.isActive}
                  onChange={(event) => updateCategoryField("isActive", event.target.checked)}
                  className="h-4 w-4 rounded border-border-default"
                />
                Categoría activa para selección pública
              </label>

              {categoryErrorMessage ? <p className="text-body-sm text-status-error">{categoryErrorMessage}</p> : null}
              {categoryMessage ? <p className="text-body-sm text-status-success">{categoryMessage}</p> : null}

              <div className="flex flex-wrap items-center gap-3 border-t border-border-soft pt-5">
                <button
                  type="submit"
                  disabled={categorySubmissionState === "saving"}
                  className="inline-flex min-h-11 items-center justify-center rounded-pill bg-brand-primary px-6 py-3 text-label-md text-text-inverse shadow-sm disabled:opacity-50"
                >
                  {categorySubmissionState === "saving"
                    ? "Guardando..."
                    : editingCategoryId
                      ? "Actualizar categoría"
                      : "Crear categoría"}
                </button>

                {(editingCategoryId || categoryForm.name || categoryForm.description || categoryImageFile) ? (
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-default px-6 py-3 text-label-md text-text-primary"
                  >
                    Cancelar
                  </button>
                ) : null}

                {editingCategoryId ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(editingCategoryId)}
                    className="inline-flex min-h-11 items-center justify-center rounded-pill border border-status-error/30 px-6 py-3 text-label-md text-status-error"
                  >
                    Eliminar categoría
                  </button>
                ) : null}
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {showProducts ? (
        <div className="grid gap-6 2xl:grid-cols-[minmax(360px,500px)_minmax(0,1fr)]">
          <section className="space-y-5 rounded-[28px] border border-border-soft bg-surface-canvas p-5 shadow-xs sm:p-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Catálogo</p>
                  <h2 className="text-section-lg text-text-primary">Productos</h2>
                  <p className="text-body-sm text-text-secondary">
                    Trabaja el catálogo local desde una pantalla separada, con lectura rápida de estado y sync metadata.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetProductForm}
                  className="rounded-xl border border-border-default px-4 py-2 text-label-md text-text-primary"
                >
                  Nuevo
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border-soft bg-surface-subtle p-3.5">
                  <p className="text-caption uppercase tracking-[0.12em] text-text-muted">Total</p>
                  <p className="mt-1 text-headline-sm text-text-primary">{products.length}</p>
                </div>
                <div className="rounded-2xl border border-border-soft bg-surface-subtle p-3.5">
                  <p className="text-caption uppercase tracking-[0.12em] text-text-muted">Activos</p>
                  <p className="mt-1 text-headline-sm text-text-primary">{activeProductCount}</p>
                </div>
                <div className="rounded-2xl border border-border-soft bg-surface-subtle p-3.5">
                  <p className="text-caption uppercase tracking-[0.12em] text-text-muted">Inactivos</p>
                  <p className="mt-1 text-headline-sm text-text-primary">{inactiveProductCount}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-border-soft bg-surface-subtle p-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <label className="space-y-2">
                <span className="block text-label-md text-text-primary">Buscar productos</span>
                <input
                  value={productSearchQuery}
                  onChange={(event) => setProductSearchQuery(event.target.value)}
                  className="w-full rounded-xl border border-border-default bg-surface-canvas px-4 py-3 text-body-md text-text-primary"
                  placeholder="Nombre, slug, descripción, badge o fuente"
                />
              </label>

              <label className="space-y-2">
                <span className="block text-label-md text-text-primary">Estado</span>
                <select
                  value={productFilter}
                  onChange={(event) => setProductFilter(event.target.value as CatalogListFilter)}
                  className="w-full rounded-xl border border-border-default bg-surface-canvas px-4 py-3 text-body-md text-text-primary"
                >
                  <option value="all">Todos</option>
                  <option value="active">Solo activos</option>
                  <option value="inactive">Solo inactivos</option>
                </select>
              </label>
            </div>

            <p className="text-body-sm text-text-secondary">
              Mostrando {filteredProducts.length} de {products.length} productos.
            </p>

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-soft bg-surface-subtle p-6 text-body-sm text-text-secondary">
                No hay productos que coincidan con los filtros actuales.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => {
                  const isEditing = editingProductId === product.id;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => startEditProduct(product)}
                      className={cx(
                        "w-full rounded-2xl border p-4 text-left transition-colors",
                        isEditing
                          ? "border-border-brand bg-surface-brandTint shadow-sm"
                          : "border-border-soft bg-surface-subtle hover:border-border-default hover:bg-surface-canvas",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-label-lg text-text-primary">{product.name}</p>
                            <span
                              className={cx(
                                "rounded-full border px-2.5 py-1 text-caption uppercase tracking-[0.12em]",
                                product.isActive
                                  ? "border-border-brand bg-surface-canvas text-text-brand"
                                  : "border-border-soft text-text-muted",
                              )}
                            >
                              {product.isActive ? "Activo" : "Inactivo"}
                            </span>
                            {product.badge ? (
                              <ProductBadge
                                label={product.badge}
                                color={product.badgeColor}
                                className="rounded-full border px-2.5 py-1"
                              />
                            ) : null}
                          </div>

                          <p className="text-body-sm text-text-secondary">{product.href}</p>
                          <p className="text-body-sm text-text-secondary">{product.description}</p>
                        </div>

                        <span className="rounded-full border border-border-soft px-2.5 py-1 text-caption uppercase tracking-[0.12em] text-text-muted">
                          {isEditing ? "Editando" : "Abrir"}
                        </span>
                      </div>

                      <div className="mt-4 space-y-1 text-body-sm text-text-secondary">
                        <p>{getMediaAssetLabel(mediaAssets, product.mediaAssetId)}</p>
                        <p>Actualizado: {formatDate(product.updatedAt)}</p>
                        <p>
                          Sync: {product.externalSourceId ? `${product.externalSourceId} · v${product.syncVersion}` : "Local manual"}
                          {product.lastSyncedAt ? ` · ${formatDate(product.lastSyncedAt)}` : ""}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-border-soft bg-surface-canvas p-5 shadow-xs sm:p-6 2xl:sticky 2xl:top-6">
            <div className="flex items-start justify-between gap-4 border-b border-border-soft pb-5">
              <div className="space-y-2">
                <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Editor</p>
                <h2 className="text-section-lg text-text-primary">
                  {editingProductId ? "Editar producto" : "Nuevo producto"}
                </h2>
                <p className="text-body-sm text-text-secondary">
                  {editingProduct
                    ? `Última actualización: ${formatDate(editingProduct.updatedAt)}`
                    : "Completa la ficha del producto sin salir del contexto del catálogo."}
                </p>
              </div>

              {(editingProductId || productForm.name || productForm.description || productForm.badge || productImageFile) ? (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="rounded-xl border border-border-default px-4 py-2 text-label-md text-text-primary"
                >
                  Limpiar
                </button>
              ) : null}
            </div>

            <form onSubmit={handleProductSubmit} className="mt-6 space-y-6">
              <div className="rounded-2xl border border-border-soft bg-surface-subtle p-4">
                <p className="text-label-md text-text-primary">Identidad pública</p>
                <p className="mt-1 text-body-sm text-text-secondary">
                  El backend deriva el slug y href del nombre para mantener consistencia entre el catálogo y el storefront.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="block text-label-md text-text-primary">Nombre</span>
                    <input
                      value={productForm.name}
                      onChange={(event) => updateProductName(event.target.value)}
                      className="w-full rounded-xl border border-border-default bg-surface-canvas px-4 py-3 text-body-md text-text-primary"
                      placeholder="Serum despigmentante"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="block text-label-md text-text-primary">Slug</span>
                      <input
                        value={productForm.slug}
                        readOnly
                        className="w-full rounded-xl border border-border-soft bg-surface-canvas px-4 py-3 text-body-md text-text-secondary"
                        placeholder="Se genera desde el nombre"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="block text-label-md text-text-primary">Href</span>
                      <input
                        value={productForm.href}
                        readOnly
                        className="w-full rounded-xl border border-border-soft bg-surface-canvas px-4 py-3 text-body-md text-text-secondary"
                        placeholder="Se genera automáticamente"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <label className="space-y-2 block">
                  <span className="block text-label-md text-text-primary">Descripción</span>
                  <textarea
                    value={productForm.description}
                    onChange={(event) => updateProductField("description", event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-border-default bg-surface-canvas px-4 py-3 text-body-md text-text-primary"
                  />
                </label>

                <div className="space-y-3 rounded-2xl border border-border-soft bg-surface-subtle p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="block text-label-md text-text-primary">Badge</span>
                    {productForm.badge ? (
                      <button type="button" onClick={clearProductBadge} className="text-body-sm text-text-secondary underline-offset-4 hover:underline">
                        Quitar
                      </button>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {badgePresetOptions.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyProductBadgePreset(preset.label, preset.color)}
                        className="rounded-full border border-border-soft px-3 py-1.5 text-body-sm text-text-primary transition hover:border-border-brand hover:bg-surface-canvas"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_132px]">
                    <label className="space-y-2">
                      <span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Texto</span>
                      <input
                        value={productForm.badge}
                        onChange={(event) => updateProductField("badge", event.target.value)}
                        className="w-full rounded-xl border border-border-default bg-surface-canvas px-4 py-3 text-body-md text-text-primary"
                        placeholder="Escribe tu badge"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="block text-caption uppercase tracking-[0.12em] text-text-muted">Color</span>
                      <input
                        type="color"
                        value={productForm.badgeColor || DEFAULT_PRODUCT_BADGE_COLOR}
                        onChange={(event) => updateProductField("badgeColor", event.target.value.toUpperCase())}
                        className="h-[52px] w-full cursor-pointer rounded-xl border border-border-default bg-surface-canvas p-2"
                        disabled={!productForm.badge}
                      />
                    </label>
                  </div>

                  {productForm.badge ? (
                    <div className="flex items-center gap-3">
                      <span className="text-body-sm text-text-secondary">Vista previa</span>
                      <ProductBadge label={productForm.badge} color={productForm.badgeColor || DEFAULT_PRODUCT_BADGE_COLOR} className="rounded-full border px-3 py-1" />
                    </div>
                  ) : (
                    <p className="text-body-sm text-text-secondary">Selecciona un preset o define un badge propio con color.</p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
                <div className="space-y-3 rounded-2xl border border-border-soft bg-surface-subtle p-4">
                  <div className="space-y-2">
                    <span className="block text-label-md text-text-primary">Imagen de producto</span>
                    <input
                      key={productFileInputKey}
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleProductImageChange(event.target.files?.[0] ?? null)}
                      className="w-full rounded-xl border border-border-default bg-surface-canvas px-4 py-3 text-body-md text-text-primary"
                    />
                  </div>

                  <p className="text-body-sm text-text-secondary">
                    {productImageFile
                      ? `Pendiente de subida: ${productImageFile.name}`
                      : `Imagen actual: ${getMediaAssetLabel(mediaAssets, productForm.mediaAssetId || null)}`}
                  </p>

                  {(productImageFile || productForm.mediaAssetId) ? (
                    <button
                      type="button"
                      onClick={() => {
                        clearProductImageSelection();
                        updateProductField("mediaAssetId", "");
                      }}
                      className="rounded-xl border border-border-default px-4 py-2 text-label-md text-text-primary"
                    >
                      Quitar imagen
                    </button>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <span className="block text-label-md text-text-primary">Previsualización</span>
                  <MediaAssetFrame
                    asset={productPreviewAsset}
                    label="Previsualización de imagen de producto"
                    minHeightClassName="min-h-[220px]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface-subtle px-4 py-3 text-body-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={productForm.isActive}
                  onChange={(event) => updateProductField("isActive", event.target.checked)}
                  className="h-4 w-4 rounded border-border-default"
                />
                Producto activo para selección pública
              </label>

              {editingProduct ? (
                <div className="rounded-2xl border border-border-soft bg-surface-subtle p-4 text-body-sm text-text-secondary">
                  <p className="text-label-md text-text-primary">Sync metadata</p>
                  <p className="mt-2">
                    {editingProduct.externalSourceId
                      ? `${editingProduct.externalSourceId} · v${editingProduct.syncVersion}`
                      : "Producto local manual"}
                  </p>
                  <p>{editingProduct.lastSyncedAt ? `Última sync: ${formatDate(editingProduct.lastSyncedAt)}` : "Sin sync externa todavía"}</p>
                </div>
              ) : null}

              {productErrorMessage ? <p className="text-body-sm text-status-error">{productErrorMessage}</p> : null}
              {productMessage ? <p className="text-body-sm text-status-success">{productMessage}</p> : null}

              <div className="flex flex-wrap items-center gap-3 border-t border-border-soft pt-5">
                <button
                  type="submit"
                  disabled={productSubmissionState === "saving"}
                  className="inline-flex min-h-11 items-center justify-center rounded-pill bg-brand-primary px-6 py-3 text-label-md text-text-inverse shadow-sm disabled:opacity-50"
                >
                  {productSubmissionState === "saving"
                    ? "Guardando..."
                    : editingProductId
                      ? "Actualizar producto"
                      : "Crear producto"}
                </button>

                {(editingProductId || productForm.name || productForm.description || productForm.badge || productImageFile) ? (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-default px-6 py-3 text-label-md text-text-primary"
                  >
                    Cancelar
                  </button>
                ) : null}

                {editingProductId ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(editingProductId)}
                    className="inline-flex min-h-11 items-center justify-center rounded-pill border border-status-error/30 px-6 py-3 text-label-md text-status-error"
                  >
                    Eliminar producto
                  </button>
                ) : null}
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
