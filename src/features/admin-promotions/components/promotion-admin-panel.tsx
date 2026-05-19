"use client";

import { startTransition, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ADMIN_COMPACT_FIELD_CLASS_NAME,
  ADMIN_COMPACT_PROMINENT_FIELD_CLASS_NAME,
} from "@/components/admin/form-styles";
import {
  ADMIN_BUTTON_DANGER_CLASS_NAME,
  ADMIN_BUTTON_NEUTRAL_SMALL_CLASS_NAME,
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_INSET_CARD_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
  ADMIN_STICKY_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";
import { cx } from "@/lib/utils";
import {
  createPromotionClient,
  deletePromotionClient,
  previewPromotionClient,
  updatePromotionClient,
} from "@/services/admin-promotions/client";
import type {
  AdminPromotionEditorData,
  AdminPromotionFormData,
  AdminPromotionItem,
  AdminPromotionPreviewRequest,
  BuyXGetYPromotionConfig,
  FreeShippingPromotionConfig,
  NthItemPercentagePromotionConfig,
  PromotionItemMatchingMode,
  PromotionRuleType,
  PromotionScopeSelection,
  PromotionStackingMode,
  PromotionTriggerType,
  VolumeDiscountPromotionConfig,
} from "@/types/admin-promotions";
import type { CheckoutPricingPreview } from "@/types/checkout-pricing";

type SubmissionState = "idle" | "saving" | "success" | "error";
type TierDiscountType = "percent" | "amount";

interface EditorTier {
  id: string;
  minQuantity: string;
  discountType: TierDiscountType;
  value: string;
}

interface PromotionEditorFormState {
  name: string;
  description: string;
  isActive: boolean;
  triggerType: PromotionTriggerType;
  couponCode: string;
  ruleType: PromotionRuleType;
  stackingMode: PromotionStackingMode;
  itemMatchingMode: PromotionItemMatchingMode;
  priority: string;
  startsAt: string;
  endsAt: string;
  scope: PromotionScopeSelection;
  buyQuantity: string;
  getQuantity: string;
  buyXGetYPercentOff: string;
  buyXGetYRepeat: boolean;
  buyXGetYAppliesToCheapest: boolean;
  itemPosition: string;
  nthPercentOff: string;
  nthRepeat: boolean;
  nthAppliesToCheapest: boolean;
  volumeTiers: EditorTier[];
  freeShippingMinQuantity: string;
  freeShippingMinSubtotal: string;
  freeShippingShippingMethods: Array<"standard" | "pickup">;
}

interface PromotionAdminPanelProps {
  initialData: AdminPromotionEditorData;
  pageMode?: "index" | "create" | "edit";
  initialEditingPromotionId?: string | null;
}

interface PromotionPreset {
  id: string;
  title: string;
  description: string;
  apply: (nextPriority: number) => PromotionEditorFormState;
}

interface PreviewCartItemState {
  id: string;
  productId: string;
  quantity: string;
}

const ruleLabels: Record<PromotionRuleType, string> = {
  buy_x_get_y: "3x2 / 2x1",
  nth_item_percentage: "Segundo o tercero al %",
  volume_discount: "Bulk por escalas",
  free_shipping: "Envío gratis",
};

const triggerLabels: Record<PromotionTriggerType, string> = {
  automatic: "Automática",
  coupon: "Cupón",
};

const stackingCopy: Record<PromotionStackingMode, { title: string; description: string }> = {
  exclusive: {
    title: "Exclusiva",
    description: "Si esta promoción entra, bloquea otras promociones sobre los mismos productos. Si no sabes cuál usar, deja esta.",
  },
  stackable: {
    title: "Acumulable",
    description: "Puede combinarse con otra promoción compatible. Úsala solo si de verdad quieres sumar descuentos.",
  },
};

const matchingModeCopy: Record<PromotionItemMatchingMode, { title: string; description: string }> = {
  same_product: {
    title: "Mismo producto",
    description: "Cada producto debe cumplir su propia cantidad. Si eliges una marca, 3x2 solo entra cuando haya 3 unidades del mismo producto.",
  },
  mixed_scope: {
    title: "Mezclar productos del alcance",
    description: "Suma unidades distintas dentro de la marca, categoría o selección elegida para activar la promoción.",
  },
};

const promotionPresets: PromotionPreset[] = [
  {
    id: "preset-3x2",
    title: "3x2",
    description: "Compra 2 y el 3ro gratis.",
    apply: (nextPriority) => ({
      ...buildEmptyPromotionForm(nextPriority),
      name: "3x2",
      description: "Compra 2 y el tercero va gratis.",
      ruleType: "buy_x_get_y",
      buyQuantity: "2",
      getQuantity: "1",
      buyXGetYPercentOff: "100",
    }),
  },
  {
    id: "preset-2x1",
    title: "2x1",
    description: "Compra 1 y el 2do gratis.",
    apply: (nextPriority) => ({
      ...buildEmptyPromotionForm(nextPriority),
      name: "2x1",
      description: "Compra 1 y el segundo va gratis.",
      ruleType: "buy_x_get_y",
      buyQuantity: "1",
      getQuantity: "1",
      buyXGetYPercentOff: "100",
    }),
  },
  {
    id: "preset-second-half",
    title: "2do al 50%",
    description: "El segundo producto paga mitad.",
    apply: (nextPriority) => ({
      ...buildEmptyPromotionForm(nextPriority),
      name: "Segundo al 50%",
      description: "El segundo producto elegible tiene 50% de descuento.",
      ruleType: "nth_item_percentage",
      itemPosition: "2",
      nthPercentOff: "50",
    }),
  },
  {
    id: "preset-third-half",
    title: "3ro al 50%",
    description: "El tercer producto paga mitad.",
    apply: (nextPriority) => ({
      ...buildEmptyPromotionForm(nextPriority),
      name: "Tercero al 50%",
      description: "El tercer producto elegible tiene 50% de descuento.",
      ruleType: "nth_item_percentage",
      itemPosition: "3",
      nthPercentOff: "50",
    }),
  },
  {
    id: "preset-bulk",
    title: "Bulk 3/6",
    description: "3 unidades descuentan 10%, 6 unidades descuentan 15%.",
    apply: (nextPriority) => ({
      ...buildEmptyPromotionForm(nextPriority),
      name: "Descuento por volumen",
      description: "Más unidades, más descuento.",
      ruleType: "volume_discount",
      stackingMode: "stackable",
      volumeTiers: [
        { id: "tier-1", minQuantity: "3", discountType: "percent", value: "10" },
        { id: "tier-2", minQuantity: "6", discountType: "percent", value: "15" },
      ],
    }),
  },
  {
    id: "preset-free-shipping",
    title: "Envío gratis",
    description: "Se activa desde cierto monto o cantidad.",
    apply: (nextPriority) => ({
      ...buildEmptyPromotionForm(nextPriority),
      name: "Envío gratis",
      description: "Envío gratis al superar la condición elegida.",
      ruleType: "free_shipping",
      freeShippingMinSubtotal: "120",
      freeShippingShippingMethods: ["standard"],
    }),
  },
];

function buildEmptyTier(index: number): EditorTier {
  return {
    id: `tier-${index + 1}`,
    minQuantity: String(index === 0 ? 3 : (index + 1) * 3),
    discountType: "percent",
    value: index === 0 ? "10" : "15",
  };
}

function buildEmptyPromotionForm(nextPriority = 10): PromotionEditorFormState {
  return {
    name: "",
    description: "",
    isActive: true,
    triggerType: "automatic",
    couponCode: "",
    ruleType: "buy_x_get_y",
    stackingMode: "exclusive",
    itemMatchingMode: "same_product",
    priority: String(nextPriority),
    startsAt: "",
    endsAt: "",
    scope: {
      productIds: [],
      categoryIds: [],
      brandIds: [],
    },
    buyQuantity: "2",
    getQuantity: "1",
    buyXGetYPercentOff: "100",
    buyXGetYRepeat: true,
    buyXGetYAppliesToCheapest: true,
    itemPosition: "2",
    nthPercentOff: "50",
    nthRepeat: true,
    nthAppliesToCheapest: true,
    volumeTiers: [buildEmptyTier(0)],
    freeShippingMinQuantity: "",
    freeShippingMinSubtotal: "",
    freeShippingShippingMethods: ["standard"],
  };
}

function buildFormFromPromotion(promotion: AdminPromotionItem): PromotionEditorFormState {
  const baseForm = buildEmptyPromotionForm(promotion.priority);
  const startsAt = toDateTimeLocalValue(promotion.startsAt);
  const endsAt = toDateTimeLocalValue(promotion.endsAt);

  switch (promotion.ruleType) {
    case "buy_x_get_y": {
      const config = promotion.config as BuyXGetYPromotionConfig;
      return {
        ...baseForm,
        name: promotion.name,
        description: promotion.description ?? "",
        isActive: promotion.isActive,
        triggerType: promotion.triggerType,
        couponCode: promotion.couponCode ?? "",
        ruleType: promotion.ruleType,
        stackingMode: promotion.stackingMode,
        itemMatchingMode: config.matchingMode ?? "same_product",
        priority: String(promotion.priority),
        startsAt,
        endsAt,
        scope: cloneScope(promotion.scope),
        buyQuantity: String(config.buyQuantity),
        getQuantity: String(config.getQuantity),
        buyXGetYPercentOff: String(config.percentOff),
        buyXGetYRepeat: config.repeat,
        buyXGetYAppliesToCheapest: config.appliesToCheapest,
      };
    }
    case "nth_item_percentage": {
      const config = promotion.config as NthItemPercentagePromotionConfig;
      return {
        ...baseForm,
        name: promotion.name,
        description: promotion.description ?? "",
        isActive: promotion.isActive,
        triggerType: promotion.triggerType,
        couponCode: promotion.couponCode ?? "",
        ruleType: promotion.ruleType,
        stackingMode: promotion.stackingMode,
        itemMatchingMode: config.matchingMode ?? "same_product",
        priority: String(promotion.priority),
        startsAt,
        endsAt,
        scope: cloneScope(promotion.scope),
        itemPosition: String(config.itemPosition),
        nthPercentOff: String(config.percentOff),
        nthRepeat: config.repeat,
        nthAppliesToCheapest: config.appliesToCheapest,
      };
    }
    case "volume_discount": {
      const config = promotion.config as VolumeDiscountPromotionConfig;
      return {
        ...baseForm,
        name: promotion.name,
        description: promotion.description ?? "",
        isActive: promotion.isActive,
        triggerType: promotion.triggerType,
        couponCode: promotion.couponCode ?? "",
        ruleType: promotion.ruleType,
        stackingMode: promotion.stackingMode,
        itemMatchingMode: config.matchingMode ?? "same_product",
        priority: String(promotion.priority),
        startsAt,
        endsAt,
        scope: cloneScope(promotion.scope),
        volumeTiers: config.tiers.map((tier, index) => ({
          id: `tier-${index + 1}`,
          minQuantity: String(tier.minQuantity),
          discountType: tier.percentOff !== undefined ? "percent" : "amount",
          value: String(tier.percentOff ?? tier.amountOffPerUnit ?? 0),
        })),
      };
    }
    case "free_shipping": {
      const config = promotion.config as FreeShippingPromotionConfig;
      return {
        ...baseForm,
        name: promotion.name,
        description: promotion.description ?? "",
        isActive: promotion.isActive,
        triggerType: promotion.triggerType,
        couponCode: promotion.couponCode ?? "",
        ruleType: promotion.ruleType,
        stackingMode: promotion.stackingMode,
        itemMatchingMode: baseForm.itemMatchingMode,
        priority: String(promotion.priority),
        startsAt,
        endsAt,
        scope: cloneScope(promotion.scope),
        freeShippingMinQuantity: config.minQuantity !== undefined ? String(config.minQuantity) : "",
        freeShippingMinSubtotal: config.minSubtotal !== undefined ? String(config.minSubtotal) : "",
        freeShippingShippingMethods: [...config.shippingMethods],
      };
    }
    default:
      return baseForm;
  }
}

function sortPromotions(promotions: AdminPromotionItem[]): AdminPromotionItem[] {
  return [...promotions].sort((left, right) => {
    if (left.priority !== right.priority) {
      return right.priority - left.priority;
    }

    return left.name.localeCompare(right.name, "es");
  });
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PromotionAdminPanel({
  initialData,
  pageMode = "index",
  initialEditingPromotionId = null,
}: PromotionAdminPanelProps) {
  const router = useRouter();
  const isCreatePage = pageMode === "create";
  const isEditPage = pageMode === "edit";
  const [promotions, setPromotions] = useState(() => sortPromotions(initialData.promotions));
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(initialEditingPromotionId);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PromotionEditorFormState>(() => {
    if (initialEditingPromotionId) {
      const promotion = initialData.promotions.find((item) => item.id === initialEditingPromotionId) ?? null;
      if (promotion) {
        return buildFormFromPromotion(promotion);
      }
    }

    return buildEmptyPromotionForm(resolveNextPriority(initialData.promotions));
  });
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [previewItems, setPreviewItems] = useState<PreviewCartItemState[]>(() => [buildPreviewCartItem(initialData.products[0]?.id ?? "")]);
  const [previewShippingMethod, setPreviewShippingMethod] = useState<"standard" | "pickup">("standard");
  const [previewState, setPreviewState] = useState<SubmissionState>("idle");
  const [previewResult, setPreviewResult] = useState<CheckoutPricingPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const activeCount = useMemo(() => promotions.filter((promotion) => promotion.isActive).length, [promotions]);
  const couponCount = useMemo(() => promotions.filter((promotion) => promotion.triggerType === "coupon").length, [promotions]);
  const editingPromotion = editingPromotionId
    ? promotions.find((promotion) => promotion.id === editingPromotionId) ?? null
    : null;

  const filteredProducts = useMemo(
    () => filterProductReferences(initialData.products, productSearch),
    [initialData.products, productSearch],
  );
  const filteredCategories = useMemo(
    () => filterNameReferences(initialData.categories, categorySearch),
    [initialData.categories, categorySearch],
  );
  const filteredBrands = useMemo(
    () => filterNameReferences(initialData.brands, brandSearch),
    [initialData.brands, brandSearch],
  );

  function resetForm() {
    if (isEditPage && editingPromotion) {
      setFormData(buildFormFromPromotion(editingPromotion));
      setSubmissionState("idle");
      setFeedbackMessage(null);
      setErrorMessage(null);
      return;
    }

    setEditingPromotionId(null);
    setSelectedPresetId(null);
    setFormData(buildEmptyPromotionForm(resolveNextPriority(promotions)));
    setSubmissionState("idle");
    setFeedbackMessage(null);
    setErrorMessage(null);
  }

  function updateField<Key extends keyof PromotionEditorFormState>(
    key: Key,
    value: PromotionEditorFormState[Key],
  ) {
    setSubmissionState("idle");
    setFeedbackMessage(null);
    setErrorMessage(null);
    setFormData((current) => ({ ...current, [key]: value }));
  }

  function updateRuleType(nextRuleType: PromotionRuleType) {
    setSubmissionState("idle");
    setFeedbackMessage(null);
    setErrorMessage(null);
    setFormData((current) => {
      const nextDefaults = buildEmptyPromotionForm(Number.parseInt(current.priority, 10) || resolveNextPriority(promotions));
      return {
        ...current,
        ruleType: nextRuleType,
        itemMatchingMode: nextDefaults.itemMatchingMode,
        buyQuantity: nextDefaults.buyQuantity,
        getQuantity: nextDefaults.getQuantity,
        buyXGetYPercentOff: nextDefaults.buyXGetYPercentOff,
        buyXGetYRepeat: nextDefaults.buyXGetYRepeat,
        buyXGetYAppliesToCheapest: nextDefaults.buyXGetYAppliesToCheapest,
        itemPosition: nextDefaults.itemPosition,
        nthPercentOff: nextDefaults.nthPercentOff,
        nthRepeat: nextDefaults.nthRepeat,
        nthAppliesToCheapest: nextDefaults.nthAppliesToCheapest,
        volumeTiers: nextDefaults.volumeTiers,
        freeShippingMinQuantity: nextDefaults.freeShippingMinQuantity,
        freeShippingMinSubtotal: nextDefaults.freeShippingMinSubtotal,
        freeShippingShippingMethods: nextDefaults.freeShippingShippingMethods,
      };
    });
  }

  function toggleScopeItem(scopeKey: keyof PromotionScopeSelection, id: string) {
    setSubmissionState("idle");
    setFeedbackMessage(null);
    setErrorMessage(null);
    setFormData((current) => {
      const currentIds = current.scope[scopeKey];
      const nextIds = currentIds.includes(id)
        ? currentIds.filter((entry) => entry !== id)
        : [...currentIds, id];

      return {
        ...current,
        scope: {
          ...current.scope,
          [scopeKey]: nextIds,
        },
      };
    });
  }

  function updateTier(id: string, patch: Partial<EditorTier>) {
    setSubmissionState("idle");
    setFeedbackMessage(null);
    setErrorMessage(null);
    setFormData((current) => ({
      ...current,
      volumeTiers: current.volumeTiers.map((tier) => (tier.id === id ? { ...tier, ...patch } : tier)),
    }));
  }

  function addTier() {
    setSubmissionState("idle");
    setFeedbackMessage(null);
    setErrorMessage(null);
    setFormData((current) => ({
      ...current,
      volumeTiers: [...current.volumeTiers, buildEmptyTier(current.volumeTiers.length)],
    }));
  }

  function removeTier(id: string) {
    setSubmissionState("idle");
    setFeedbackMessage(null);
    setErrorMessage(null);
    setFormData((current) => ({
      ...current,
      volumeTiers: current.volumeTiers.length > 1
        ? current.volumeTiers.filter((tier) => tier.id !== id)
        : current.volumeTiers,
    }));
  }

  function toggleFreeShippingMethod(method: "standard" | "pickup") {
    setSubmissionState("idle");
    setFeedbackMessage(null);
    setErrorMessage(null);
    setFormData((current) => {
      const nextMethods = current.freeShippingShippingMethods.includes(method)
        ? current.freeShippingShippingMethods.filter((entry) => entry !== method)
        : [...current.freeShippingShippingMethods, method];

      return {
        ...current,
        freeShippingShippingMethods: nextMethods.length > 0 ? nextMethods : current.freeShippingShippingMethods,
      };
    });
  }

  function startEdit(promotion: AdminPromotionItem) {
    if (pageMode === "index") {
      router.push(`/admin/catalog/promotions/${promotion.id}`);
      return;
    }

    setEditingPromotionId(promotion.id);
    setSelectedPresetId(null);
    setFormData(buildFormFromPromotion(promotion));
    setSubmissionState("idle");
    setFeedbackMessage(null);
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionState("saving");
    setFeedbackMessage(null);
    setErrorMessage(null);

    startTransition(() => {
      void (async () => {
        const payload = serializePromotionForm(formData);
        const promotion = editingPromotionId
          ? await updatePromotionClient(editingPromotionId, payload)
          : await createPromotionClient(payload);

        setPromotions((current) => sortPromotions([promotion, ...current.filter((item) => item.id !== promotion.id)]));
        setSubmissionState("success");
        setFeedbackMessage(editingPromotionId ? "Promoción actualizada correctamente." : "Promoción creada correctamente.");
        setEditingPromotionId(promotion.id);
        setFormData(buildFormFromPromotion(promotion));

        if (!editingPromotionId) {
          router.push(`/admin/catalog/promotions/${promotion.id}`);
          router.refresh();
        }
      })().catch((error) => {
        setSubmissionState("error");
        setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar la promoción.");
      });
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Se eliminara la promoción seleccionada. Esta acción no se puede deshacer.")) {
      return;
    }

    setSubmissionState("saving");
    setFeedbackMessage(null);
    setErrorMessage(null);

    startTransition(() => {
      void deletePromotionClient(id)
        .then((deletedId) => {
          setPromotions((current) => sortPromotions(current.filter((item) => item.id !== deletedId)));
          setSubmissionState("success");
          setFeedbackMessage("Promoción eliminada correctamente.");
          if (editingPromotionId === deletedId) {
            if (isEditPage) {
              router.push("/admin/catalog/promotions");
              router.refresh();
            } else {
              setEditingPromotionId(null);
              setFormData(buildEmptyPromotionForm(resolveNextPriority(promotions.filter((promotion) => promotion.id !== deletedId))));
            }
          }
        })
        .catch((error) => {
          setSubmissionState("error");
          setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar la promoción.");
        });
    });
  }

  const editorSummary = buildEditorSummary(formData);
  const nextPriority = resolveNextPriority(promotions);

  function applyPreset(preset: PromotionPreset) {
    setEditingPromotionId(null);
    setSelectedPresetId(preset.id);
    setSubmissionState("idle");
    setFeedbackMessage(null);
    setErrorMessage(null);
    setFormData(preset.apply(nextPriority));
  }

  function updatePreviewItem(id: string, patch: Partial<PreviewCartItemState>) {
    setPreviewState("idle");
    setPreviewResult(null);
    setPreviewError(null);
    setPreviewItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addPreviewItem() {
    const fallbackProductId = initialData.products[0]?.id ?? "";
    setPreviewState("idle");
    setPreviewResult(null);
    setPreviewError(null);
    setPreviewItems((current) => [...current, buildPreviewCartItem(fallbackProductId)]);
  }

  function removePreviewItem(id: string) {
    setPreviewState("idle");
    setPreviewResult(null);
    setPreviewError(null);
    setPreviewItems((current) => current.length > 1 ? current.filter((item) => item.id !== id) : current);
  }

  function handlePreviewSimulation() {
    setPreviewState("saving");
    setPreviewResult(null);
    setPreviewError(null);

    const items = previewItems
      .map((item) => ({
        productId: item.productId,
        quantity: parseIntegerField(item.quantity, 0),
      }))
      .filter((item) => item.productId.trim().length > 0 && item.quantity > 0);

    if (items.length === 0) {
      setPreviewState("error");
      setPreviewError("Añade al menos un producto válido para simular la promoción.");
      return;
    }

    const request: AdminPromotionPreviewRequest = {
      items,
      shippingMethod: previewShippingMethod,
      couponCode: formData.triggerType === "coupon" ? normalizeNullableString(formData.couponCode) : null,
      editingPromotionId,
      promotion: serializePromotionForm(formData),
    };

    startTransition(() => {
      void previewPromotionClient(request)
        .then((preview) => {
          setPreviewState("success");
          setPreviewResult(preview);
        })
        .catch((error) => {
          setPreviewState("error");
          setPreviewError(error instanceof Error ? error.message : "No se pudo calcular la simulación.");
        });
    });
  }

  const editorPanel = (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-border-soft pb-5">
        <div className="space-y-2">
          <p className="text-caption uppercase tracking-[0.14em] text-text-muted">
            {isCreatePage ? "Nueva promoción" : "Editor"}
          </p>
          <h2 className="text-section-lg text-text-primary">
            {editingPromotion ? "Editar promoción" : "Nueva promoción"}
          </h2>
          <p className="text-body-sm text-text-secondary">
            {editingPromotion
              ? `Última actualización: ${formatDate(editingPromotion.updatedAt)}`
              : "Define reglas, alcance y condiciones para el checkout."}
          </p>
        </div>

        {(editingPromotion || formData.name.trim().length > 0) ? (
          <button type="button" onClick={resetForm} className={ADMIN_BUTTON_NEUTRAL_SMALL_CLASS_NAME}>
            Limpiar
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <section className="space-y-4 rounded-2xl border border-border-soft bg-surface-subtle p-4">
          <div>
            <p className="text-label-md text-text-primary">Atajos listos</p>
            <p className="text-body-sm text-text-secondary">Si quieres ir rápido, elige un modelo base y luego ajustas lo mínimo.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {promotionPresets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  aria-pressed={isSelected}
                  className={cx(
                    `${ADMIN_INSET_CARD_CLASS_NAME} relative text-left transition-[border-color,background-color,box-shadow] duration-[200ms] ease-soft hover:border-border-brand hover:bg-surface-brandTint`,
                    isSelected && "border-[color:var(--color-border-brand)] bg-surface-brandTint shadow-[0_16px_34px_-26px_rgba(32,92,76,0.34)]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-label-md text-text-primary">{preset.title}</p>
                      <p className="mt-1 text-body-sm text-text-secondary">{preset.description}</p>
                    </div>

                    <span
                      className={cx(
                        "inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-2 text-caption uppercase tracking-[0.12em] transition-[border-color,background-color,color] duration-[200ms] ease-soft",
                        isSelected
                          ? "border-border-brand bg-surface-canvas text-text-brand"
                          : "border-border-soft bg-surface-canvas text-text-muted",
                      )}
                    >
                      {isSelected ? "OK" : "Atajo"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <label className="block space-y-2">
          <span className="block text-label-md text-text-primary">Nombre</span>
          <input
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={ADMIN_COMPACT_PROMINENT_FIELD_CLASS_NAME}
            placeholder="3x2 en limpiadores"
          />
        </label>

        <label className="block space-y-2">
          <span className="block text-label-md text-text-primary">Descripción</span>
          <textarea
            value={formData.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={3}
            className={ADMIN_COMPACT_FIELD_CLASS_NAME}
            placeholder="Visible solo para operación interna"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="¿Qué tipo de oferta quieres?" description="Elige la lógica más parecida a tu promo." value={formData.ruleType} onChange={(value) => updateRuleType(value as PromotionRuleType)}>
            <option value="buy_x_get_y">3x2 / 2x1</option>
            <option value="nth_item_percentage">Segundo o tercero al 50%</option>
            <option value="volume_discount">Bulk por escalas</option>
            <option value="free_shipping">Envío gratis</option>
          </SelectField>

          <SelectField label="¿Cómo se activa?" description="Automática = se aplica sola. Cupón = el cliente debe escribir un código." value={formData.triggerType} onChange={(value) => updateField("triggerType", value as PromotionTriggerType)}>
            <option value="automatic">Automática</option>
            <option value="coupon">Cupón</option>
          </SelectField>
        </div>

        <ToggleCheckbox checked={formData.isActive} onChange={(checked) => updateField("isActive", checked)} label="Promoción activa para checkout" />

        <section className="space-y-4 rounded-2xl border border-border-soft bg-surface-subtle p-4">
          <div>
            <p className="text-label-md text-text-primary">¿Puede sumarse con otra promoción?</p>
            <p className="text-body-sm text-text-secondary">
              `Stacking` significa si esta promoción puede convivir con otra en el mismo checkout.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(["exclusive", "stackable"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => updateField("stackingMode", mode)}
                className={cx(
                  "rounded-2xl border p-4 text-left transition-colors",
                  formData.stackingMode === mode
                    ? "border-border-brand bg-surface-brandTint"
                    : "border-border-soft bg-surface-canvas hover:border-border-default",
                )}
                aria-pressed={formData.stackingMode === mode}
              >
                <p className="text-label-md text-text-primary">{stackingCopy[mode].title}</p>
                <p className="mt-1 text-body-sm text-text-secondary">{stackingCopy[mode].description}</p>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="block space-y-2">
            <span className="block text-label-md text-text-primary">Prioridad</span>
            <span className="block text-body-sm text-text-secondary">Número más alto = se evalúa antes. Si no estás seguro, déjalo como está.</span>
            <input
              type="number"
              value={formData.priority}
              onChange={(event) => updateField("priority", event.target.value)}
              className={ADMIN_COMPACT_FIELD_CLASS_NAME}
            />
          </label>

          <DateTimeField label="Inicio" value={formData.startsAt} onChange={(value) => updateField("startsAt", value)} />
          <DateTimeField label="Fin" value={formData.endsAt} onChange={(value) => updateField("endsAt", value)} />
        </div>

        {formData.triggerType === "coupon" ? (
          <label className="block space-y-2">
            <span className="block text-label-md text-text-primary">Código de cupón</span>
            <span className="block text-body-sm text-text-secondary">Ejemplo: `BULK10`. El cliente debe escribirlo exactamente igual.</span>
            <input
              value={formData.couponCode}
              onChange={(event) => updateField("couponCode", event.target.value.toUpperCase())}
              className={ADMIN_COMPACT_FIELD_CLASS_NAME}
              placeholder="BULK10"
            />
          </label>
        ) : null}

        <section className="space-y-4 rounded-2xl border border-border-soft bg-surface-subtle p-4">
          <div>
            <p className="text-label-md text-text-primary">Regla</p>
            <p className="text-body-sm text-text-secondary">Completa solo los campos del tipo seleccionado. Debajo te explico qué significa cada uno.</p>
          </div>

          {formData.ruleType !== "free_shipping" ? (
            <div className="space-y-4 rounded-2xl border border-border-soft bg-surface-canvas p-4">
              <div>
                <p className="text-label-md text-text-primary">Cómo se cuentan las unidades</p>
                <p className="text-body-sm text-text-secondary">Define si la promo debe juntar productos distintos dentro del alcance o si cada SKU debe cumplir la cantidad por separado.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {(["same_product", "mixed_scope"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateField("itemMatchingMode", mode)}
                    className={cx(
                      "rounded-2xl border p-4 text-left transition-colors",
                      formData.itemMatchingMode === mode
                        ? "border-border-brand bg-surface-brandTint"
                        : "border-border-soft bg-surface-canvas hover:border-border-default",
                    )}
                    aria-pressed={formData.itemMatchingMode === mode}
                  >
                    <p className="text-label-md text-text-primary">{matchingModeCopy[mode].title}</p>
                    <p className="mt-1 text-body-sm text-text-secondary">{matchingModeCopy[mode].description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {formData.ruleType === "buy_x_get_y" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <RuleHint>
                Ejemplo rápido: para 3x2, pon `Compra 2`, `Recibe 1`, `% descuento 100`.
              </RuleHint>
              <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
                <NumberField label="Cuántas paga el cliente" description="Si quieres 3x2, aquí va 2." value={formData.buyQuantity} onChange={(value) => updateField("buyQuantity", value)} />
                <NumberField label="Cuántas reciben descuento" description="Para 3x2 o 2x1 normalmente será 1." value={formData.getQuantity} onChange={(value) => updateField("getQuantity", value)} />
                <NumberField label="Qué descuento reciben" description="100 = gratis. 50 = mitad de precio." value={formData.buyXGetYPercentOff} onChange={(value) => updateField("buyXGetYPercentOff", value)} />
              </div>
              <div className="flex flex-col justify-end gap-3 md:col-span-2">
                <ToggleCheckbox checked={formData.buyXGetYRepeat} onChange={(checked) => updateField("buyXGetYRepeat", checked)} label="Repetir si hay suficientes unidades" description="Ejemplo: si compra 6 en una promo 3x2, se aplica dos veces." />
                <ToggleCheckbox checked={formData.buyXGetYAppliesToCheapest} onChange={(checked) => updateField("buyXGetYAppliesToCheapest", checked)} label="Descontar primero las unidades más baratas" description="Suele ser la opción más segura para evitar sobre-descontar." />
              </div>
            </div>
          ) : null}

          {formData.ruleType === "nth_item_percentage" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <RuleHint>
                Ejemplo: para segundo al 50%, pon `Posición 2` y `% descuento 50`.
              </RuleHint>
              <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
                <NumberField label="Qué producto recibe el descuento" description="2 = segundo producto. 3 = tercer producto." value={formData.itemPosition} onChange={(value) => updateField("itemPosition", value)} />
                <NumberField label="Qué descuento recibe" description="50 = paga la mitad. 100 = gratis." value={formData.nthPercentOff} onChange={(value) => updateField("nthPercentOff", value)} />
              </div>
              <div className="flex flex-col justify-end gap-3 md:col-span-2">
                <ToggleCheckbox checked={formData.nthRepeat} onChange={(checked) => updateField("nthRepeat", checked)} label="Repetir si hay varias tandas" description="Ejemplo: en segundo al 50%, con 4 unidades se aplicaría dos veces." />
                <ToggleCheckbox checked={formData.nthAppliesToCheapest} onChange={(checked) => updateField("nthAppliesToCheapest", checked)} label="Aplicar sobre las unidades más baratas" description="Recomendado si mezclan productos con precios distintos." />
              </div>
            </div>
          ) : null}

          {formData.ruleType === "volume_discount" ? (
            <div className="space-y-4">
              <RuleHint>
                Cada escala dice: desde cuántas unidades, cuánto descuento se activa.
              </RuleHint>
              {formData.volumeTiers.map((tier, index) => (
                <div key={tier.id} className="rounded-2xl border border-border-soft bg-surface-canvas p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-label-md text-text-primary">Escala {index + 1}</p>
                    {formData.volumeTiers.length > 1 ? (
                      <button type="button" onClick={() => removeTier(tier.id)} className="text-body-sm text-status-error">
                        Eliminar
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <NumberField label="Desde cuántas unidades" description="Cuando el carrito llegue a esta cantidad, entra esta escala." value={tier.minQuantity} onChange={(value) => updateTier(tier.id, { minQuantity: value })} />
                    <SelectField label="Tipo de descuento" description="Porcentaje o monto fijo por cada unidad." value={tier.discountType} onChange={(value) => updateTier(tier.id, { discountType: value as TierDiscountType, value: "" })}>
                      <option value="percent">Porcentaje</option>
                      <option value="amount">Monto por unidad</option>
                    </SelectField>
                    <NumberField label={tier.discountType === "percent" ? "Valor del descuento" : "Monto a restar"} description={tier.discountType === "percent" ? "10 = 10% de descuento." : "Se resta ese monto a cada unidad elegible."} value={tier.value} onChange={(value) => updateTier(tier.id, { value })} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addTier} className={ADMIN_BUTTON_NEUTRAL_SMALL_CLASS_NAME}>
                Añadir escala
              </button>
            </div>
          ) : null}

          {formData.ruleType === "free_shipping" ? (
            <div className="space-y-4">
              <RuleHint>
                Puedes usar cantidad, monto, o ambas condiciones. Si completas ambas, cualquiera de las dos puede activar la promo.
              </RuleHint>
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField label="Cantidad mínima" description="Ejemplo: 4 unidades." value={formData.freeShippingMinQuantity} onChange={(value) => updateField("freeShippingMinQuantity", value)} allowEmpty />
                <NumberField label="Subtotal mínimo" description="Ejemplo: 120 para envío gratis desde $120." value={formData.freeShippingMinSubtotal} onChange={(value) => updateField("freeShippingMinSubtotal", value)} allowEmpty />
              </div>
              <div className="space-y-3 rounded-2xl border border-border-soft bg-surface-canvas p-4">
                <p className="text-label-md text-text-primary">Métodos de envío</p>
                <ToggleCheckbox checked={formData.freeShippingShippingMethods.includes("standard")} onChange={() => toggleFreeShippingMethod("standard")} label="Envío estándar" description="La promo elimina el costo del envío normal." />
                <ToggleCheckbox checked={formData.freeShippingShippingMethods.includes("pickup")} onChange={() => toggleFreeShippingMethod("pickup")} label="Retiro en tienda" description="Normalmente no hace falta, porque retiro suele costar 0." />
              </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-4 rounded-2xl border border-border-soft bg-surface-subtle p-4">
          <div>
            <p className="text-label-md text-text-primary">Alcance</p>
            <p className="text-body-sm text-text-secondary">Si no seleccionas nada en una sección, la promoción aplica a todos los elementos de esa dimensión.</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.3fr)_minmax(0,0.3fr)_minmax(0,0.4fr)]">
            <SelectionSection
              title="Categorías"
              searchValue={categorySearch}
              onSearchChange={setCategorySearch}
              placeholder="Buscar categoría"
              itemCount={formData.scope.categoryIds.length}
            >
              {filteredCategories.map((category) => (
                <SelectionCheckbox
                  key={category.id}
                  checked={formData.scope.categoryIds.includes(category.id)}
                  onChange={() => toggleScopeItem("categoryIds", category.id)}
                  label={category.name}
                />
              ))}
            </SelectionSection>

            <SelectionSection
              title="Marcas"
              searchValue={brandSearch}
              onSearchChange={setBrandSearch}
              placeholder="Buscar marca"
              itemCount={formData.scope.brandIds.length}
            >
              {filteredBrands.map((brand) => (
                <SelectionCheckbox
                  key={brand.id}
                  checked={formData.scope.brandIds.includes(brand.id)}
                  onChange={() => toggleScopeItem("brandIds", brand.id)}
                  label={brand.name}
                />
              ))}
            </SelectionSection>

            <SelectionSection
              title="Productos"
              searchValue={productSearch}
              onSearchChange={setProductSearch}
              placeholder="Buscar producto o marca"
              itemCount={formData.scope.productIds.length}
            >
              {filteredProducts.map((product) => (
                <SelectionCheckbox
                  key={product.id}
                  checked={formData.scope.productIds.includes(product.id)}
                  onChange={() => toggleScopeItem("productIds", product.id)}
                  label={product.name}
                  thumbnailUrl={product.mediaAssetPublicUrl}
                  thumbnailAlt={product.mediaAssetAltText || product.name}
                />
              ))}
            </SelectionSection>
          </div>
        </section>

        <section className="rounded-2xl border border-border-soft bg-surface-subtle p-4">
          <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Resumen rápido</p>
          <div className="mt-3 space-y-3">
            <p className="text-section-sm text-text-primary">{formData.name.trim() || ruleLabels[formData.ruleType]}</p>
            <p className="text-body-md text-text-secondary">{editorSummary}</p>
            <div className="flex flex-wrap gap-2">
              <Chip tone="brand">{ruleLabels[formData.ruleType]}</Chip>
              <Chip tone="neutral">{triggerLabels[formData.triggerType]}</Chip>
              <Chip tone={formData.isActive ? "success" : "neutral"}>{formData.isActive ? "Activa" : "Inactiva"}</Chip>
              {formData.ruleType !== "free_shipping" ? (
                <Chip tone="neutral">{formData.itemMatchingMode === "same_product" ? "Por producto" : "Mezcla alcance"}</Chip>
              ) : null}
            </div>
            <div className="grid gap-3 text-body-sm text-text-secondary sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-border-soft bg-surface-canvas px-3 py-2.5">
                <p className="text-caption uppercase tracking-[0.12em] text-text-muted">Prioridad</p>
                <p className="mt-1 text-text-primary">{formData.priority || "-"}</p>
              </div>
              <div className="rounded-xl border border-border-soft bg-surface-canvas px-3 py-2.5">
                <p className="text-caption uppercase tracking-[0.12em] text-text-muted">Categorías</p>
                <p className="mt-1 text-text-primary">{formData.scope.categoryIds.length || "Todas"}</p>
              </div>
              <div className="rounded-xl border border-border-soft bg-surface-canvas px-3 py-2.5">
                <p className="text-caption uppercase tracking-[0.12em] text-text-muted">Marcas</p>
                <p className="mt-1 text-text-primary">{formData.scope.brandIds.length || "Todas"}</p>
              </div>
              <div className="rounded-xl border border-border-soft bg-surface-canvas px-3 py-2.5">
                <p className="text-caption uppercase tracking-[0.12em] text-text-muted">Productos</p>
                <p className="mt-1 text-text-primary">{formData.scope.productIds.length || "Todos"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border-soft bg-surface-subtle p-4">
          <div>
            <p className="text-label-md text-text-primary">Simulación rápida</p>
            <p className="text-body-sm text-text-secondary">
              Prueba esta promoción con un carrito de ejemplo antes de guardarla.
            </p>
          </div>

          <div className="space-y-3">
            {previewItems.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-border-soft bg-surface-canvas p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-label-md text-text-primary">Producto {index + 1}</p>
                  {previewItems.length > 1 ? (
                    <button type="button" onClick={() => removePreviewItem(item.id)} className="text-body-sm text-status-error">
                      Quitar
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_112px]">
                  <SelectField label="Producto" value={item.productId} onChange={(value) => updatePreviewItem(item.id, { productId: value })}>
                    {initialData.products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} · {product.brand}
                      </option>
                    ))}
                  </SelectField>
                  <NumberField label="Cantidad" value={item.quantity} onChange={(value) => updatePreviewItem(item.id, { quantity: value })} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={addPreviewItem} className={ADMIN_BUTTON_NEUTRAL_SMALL_CLASS_NAME}>
              Añadir producto
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Método de envío" value={previewShippingMethod} onChange={(value) => setPreviewShippingMethod(value as "standard" | "pickup")}>
              <option value="standard">Envío estándar</option>
              <option value="pickup">Retiro en tienda</option>
            </SelectField>

            <label className="block space-y-2">
              <span className="block text-label-md text-text-primary">Cupón usado en la simulación</span>
              <div className="rounded-lg border border-border-soft bg-surface-canvas px-3 py-2.5 text-body-sm text-text-secondary">
                {formData.triggerType === "coupon"
                  ? normalizeNullableString(formData.couponCode) ?? "Escribe un código en la promoción para probarlo"
                  : "No aplica, porque la promoción es automática"}
              </div>
            </label>
          </div>

          <button type="button" onClick={handlePreviewSimulation} className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}>
            {previewState === "saving" ? "Calculando..." : "Calcular ejemplo"}
          </button>

          {previewError ? <p className="text-body-sm text-status-error">{previewError}</p> : null}

          {previewResult ? (
            <div className="space-y-3 rounded-2xl border border-border-soft bg-surface-canvas p-4">
              <p className="text-label-md text-text-primary">Resultado del ejemplo</p>
              <div className="space-y-2 text-body-sm text-text-secondary">
                {previewResult.lines.map((line) => (
                  <div key={line.productId} className="rounded-xl border border-border-soft bg-surface-subtle px-3 py-2.5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-text-primary">{line.productName}</p>
                        <p>{line.quantity} × {formatMoney(line.finalUnitPrice)}</p>
                      </div>
                      <p className="text-text-primary">{formatMoney(line.finalSubtotal)}</p>
                    </div>
                    {line.adjustments.length > 0 ? (
                      <div className="mt-2 space-y-1 text-text-muted">
                        {line.adjustments.map((adjustment) => (
                          <p key={`${line.productId}-${adjustment.promotionId}`}>- {adjustment.description}: {formatMoney(adjustment.amount)}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border-soft bg-surface-subtle p-3 text-body-sm text-text-secondary">
                <p>Subtotal mercancía: {formatMoney(previewResult.totals.merchandiseSubtotal)}</p>
                <p>Descuento: {formatMoney(previewResult.totals.discountTotal)}</p>
                <p>Envío: {formatMoney(previewResult.totals.shippingTotal)}</p>
                <p className="mt-2 text-label-md text-text-primary">Total: {formatMoney(previewResult.totals.total)}</p>
              </div>

              {previewResult.appliedPromotions.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-label-md text-text-primary">Promociones aplicadas</p>
                  {previewResult.appliedPromotions.map((promotion) => (
                    <div key={promotion.promotionId} className="rounded-xl border border-border-soft bg-surface-subtle px-3 py-2.5 text-body-sm text-text-secondary">
                      <p className="text-text-primary">{promotion.promotionName}</p>
                      <p>{promotion.description}</p>
                      <p>Impacto: {formatMoney(promotion.amount)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-body-sm text-text-secondary">En este ejemplo no se aplicó ninguna promoción.</p>
              )}
            </div>
          ) : null}
        </section>

        {errorMessage ? <p className="text-body-sm text-status-error">{errorMessage}</p> : null}
        {feedbackMessage ? <p className="text-body-sm text-status-success">{feedbackMessage}</p> : null}

        <div className="flex flex-col gap-3 border-t border-border-soft pt-5 sm:flex-row sm:flex-wrap sm:items-center">
          <button type="submit" disabled={submissionState === "saving"} className={`${ADMIN_BUTTON_PRIMARY_CLASS_NAME} w-full sm:w-auto`}>
            {submissionState === "saving" ? "Guardando..." : editingPromotion ? "Actualizar promoción" : "Crear promoción"}
          </button>

          {(editingPromotion || formData.name.trim()) ? (
            <button type="button" onClick={resetForm} className={`${ADMIN_BUTTON_SECONDARY_CLASS_NAME} w-full sm:w-auto`}>
              Cancelar
            </button>
          ) : null}

          {editingPromotion ? (
            <button type="button" onClick={() => handleDelete(editingPromotion.id)} className={`${ADMIN_BUTTON_DANGER_CLASS_NAME} w-full sm:w-auto`}>
              Eliminar promoción
            </button>
          ) : null}

          {isCreatePage ? (
            <Link href="/admin/catalog/promotions" className={`${ADMIN_BUTTON_SECONDARY_CLASS_NAME} w-full sm:w-auto`}>
              Volver al listado
            </Link>
          ) : null}
        </div>
      </form>
    </>
  );

  if (isCreatePage || isEditPage) {
    return (
      <div className={cx("space-y-6", (isCreatePage || isEditPage) && "mx-auto max-w-6xl") }>
        <section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <AdminBreadcrumbs
                items={[
                  { label: "Admin", href: "/admin/leads" },
                  { label: "Catalogo", href: "/admin/catalog/categories" },
                  { label: "Promociones", href: "/admin/catalog/promotions" },
                  { label: isCreatePage ? "Nueva promoción" : editingPromotion?.name || "Editar promoción" },
                ]}
              />
              <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Catalogo</p>
              <h1 className="text-section-lg text-text-primary sm:text-headline-sm">{isCreatePage ? "Nueva promoción" : "Editar promoción"}</h1>
              <p className="max-w-3xl text-body-sm text-text-secondary">
                {isCreatePage
                  ? "Crea una promoción en una pantalla dedicada, compacta y con más aire para configurar reglas largas sin que todo se vea amontonado."
                  : "Ajusta la promoción en una pantalla dedicada, sin compartir espacio con el listado."}
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Link href="/admin/catalog/promotions" className={`${ADMIN_BUTTON_SECONDARY_CLASS_NAME} w-full sm:w-auto`}>
                Volver al listado
              </Link>
              <Link href="/admin/catalog/promotions/new" className={`${ADMIN_BUTTON_PRIMARY_CLASS_NAME} w-full sm:w-auto`}>
                Nueva promoción
              </Link>
            </div>
          </div>
        </section>

        <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>{editorPanel}</section>
      </div>
    );
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
                { label: "Promociones", href: "/admin/catalog/promotions" },
                ...(isCreatePage ? [{ label: "Nueva promoción" }] : []),
              ]}
            />
            <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Catalogo</p>
            <h1 className="text-section-lg text-text-primary sm:text-headline-sm">{isCreatePage ? "Nueva promoción" : "Promociones y descuentos"}</h1>
            <p className="max-w-3xl text-body-sm text-text-secondary">
              {isCreatePage
                ? "Crea una promoción en una pantalla dedicada, compacta y con más aire para configurar reglas largas sin que todo se vea amontonado."
                : "Configura ofertas complejas sobre el precio base del catálogo: 3x2, segundo o tercero al 50%, escalas bulk y envío gratis por cantidad o monto."}
            </p>
          </div>

          {!isCreatePage ? (
            <Link href="/admin/catalog/promotions/new" className={`${ADMIN_BUTTON_PRIMARY_CLASS_NAME} w-full sm:w-auto`}>
              Nueva promoción
            </Link>
          ) : null}
        </div>
      </section>

      <section className={`space-y-5 ${ADMIN_PANEL_SURFACE_CLASS_NAME}`}>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Total" value={String(promotions.length)} helper="promociones registradas" />
              <StatCard label="Activas" value={String(activeCount)} helper="listas para checkout" />
              <StatCard label="Con cupón" value={String(couponCount)} helper="requieren código" />
            </div>

            {promotions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-soft bg-surface-subtle p-6 text-body-sm text-text-secondary">
                Todavía no hay promociones. Crea la primera para activar ofertas complejas en el checkout.
              </div>
            ) : (
              <div className="rounded-[24px] border border-border-soft bg-surface-subtle">
                <div className="space-y-3 px-3 py-3 md:hidden">
                  {promotions.map((promotion) => (
                    <article key={promotion.id} className="rounded-2xl border border-border-soft bg-surface-canvas p-4 shadow-[0_14px_28px_-24px_rgba(28,56,41,0.25)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1.5">
                          <Link href={`/admin/catalog/promotions/${promotion.id}`} className="block rounded-lg px-1 py-0.5 text-label-md text-text-primary transition-[color,background-color,border-color] duration-[200ms] ease-soft hover:bg-surface-subtle hover:text-text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas">
                            {promotion.name}
                          </Link>
                          <p className="text-body-sm text-text-secondary">
                            {promotion.description?.trim().length ? promotion.description : editorDescriptionFallback(promotion.ruleType)}
                          </p>
                        </div>

                        <span className="rounded-full border border-border-soft px-2.5 py-1 text-caption uppercase tracking-[0.12em] text-text-muted">
                          P{promotion.priority}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Chip tone={promotion.isActive ? "success" : "neutral"}>{promotion.isActive ? "Activa" : "Inactiva"}</Chip>
                        <Chip tone="brand">{ruleLabels[promotion.ruleType]}</Chip>
                        <Chip tone="neutral">{triggerLabels[promotion.triggerType]}</Chip>
                        {promotion.couponCode ? <Chip tone="warning">{promotion.couponCode}</Chip> : null}
                      </div>

                      <dl className="mt-4 grid gap-3 text-body-sm text-text-secondary sm:grid-cols-2">
                        <div>
                          <dt className="text-caption uppercase tracking-[0.12em] text-text-muted">Conteo</dt>
                          <dd className="mt-1">{resolvePromotionMatchingModeLabel(promotion)}</dd>
                        </div>
                        <div>
                          <dt className="text-caption uppercase tracking-[0.12em] text-text-muted">Actualizado</dt>
                          <dd className="mt-1">{formatDate(promotion.updatedAt)}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-caption uppercase tracking-[0.12em] text-text-muted">Alcance</dt>
                          <dd className="mt-1">{resolvePromotionScopeSummary(promotion)}</dd>
                        </div>
                      </dl>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Link href={`/admin/catalog/promotions/${promotion.id}`} className={`${ADMIN_BUTTON_SECONDARY_CLASS_NAME} w-full sm:w-auto`}>
                          Editar
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border-soft text-caption uppercase tracking-[0.12em] text-text-muted">
                        <th className="px-4 py-3 font-medium">Promoción</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium">Regla</th>
                        <th className="px-4 py-3 font-medium">Activación</th>
                        <th className="px-4 py-3 font-medium">Conteo</th>
                        <th className="px-4 py-3 font-medium">Alcance</th>
                        <th className="px-4 py-3 font-medium">Actualizado</th>
                        <th className="px-4 py-3 font-medium text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promotions.map((promotion) => (
                        <tr key={promotion.id} className="border-b border-border-soft/80 bg-surface-canvas transition-colors hover:bg-surface-subtle/60">
                          <td className="px-4 py-4 align-top">
                            <div className="space-y-1">
                              <Link href={`/admin/catalog/promotions/${promotion.id}`} className="rounded-lg px-1 py-0.5 text-label-md text-text-primary transition-[color,background-color,border-color] duration-[200ms] ease-soft hover:bg-surface-subtle hover:text-text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas">
                                {promotion.name}
                              </Link>
                              <p className="text-body-sm text-text-secondary">
                                {promotion.description?.trim().length ? promotion.description : editorDescriptionFallback(promotion.ruleType)}
                              </p>
                              <p className="text-caption text-text-muted">P{promotion.priority}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <span className={cx("inline-flex rounded-full px-2.5 py-0.5 text-label-sm", promotion.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700")}>
                              {promotion.isActive ? "Activa" : "Inactiva"}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-top text-body-sm text-text-secondary">{ruleLabels[promotion.ruleType]}</td>
                          <td className="px-4 py-4 align-top text-body-sm text-text-secondary">
                            <div className="space-y-1">
                              <p className="font-medium text-text-primary">{triggerLabels[promotion.triggerType]}</p>
                              <p>{promotion.couponCode ?? "Sin cupón"}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top text-body-sm text-text-secondary">{resolvePromotionMatchingModeLabel(promotion)}</td>
                          <td className="px-4 py-4 align-top text-body-sm text-text-secondary">{resolvePromotionScopeSummary(promotion)}</td>
                          <td className="px-4 py-4 align-top text-body-sm text-text-secondary">{formatDate(promotion.updatedAt)}</td>
                          <td className="px-4 py-4 text-right align-top">
                            <Link href={`/admin/catalog/promotions/${promotion.id}`} className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}>
                              Editar
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
      </section>
    </div>
  );
}

function serializePromotionForm(formData: PromotionEditorFormState): AdminPromotionFormData {
  return {
    name: formData.name.trim(),
    description: formData.description.trim(),
    isActive: formData.isActive,
    triggerType: formData.triggerType,
    couponCode: formData.triggerType === "coupon" ? normalizeNullableString(formData.couponCode) : null,
    ruleType: formData.ruleType,
    stackingMode: formData.stackingMode,
    priority: parseIntegerField(formData.priority, 0),
    startsAt: normalizeDateTimeField(formData.startsAt),
    endsAt: normalizeDateTimeField(formData.endsAt),
    scope: cloneScope(formData.scope),
    config: serializePromotionConfig(formData),
  };
}

function serializePromotionConfig(formData: PromotionEditorFormState): AdminPromotionFormData["config"] {
  switch (formData.ruleType) {
    case "buy_x_get_y":
      return {
        buyQuantity: parseIntegerField(formData.buyQuantity, 1),
        getQuantity: parseIntegerField(formData.getQuantity, 1),
        percentOff: parseNumberField(formData.buyXGetYPercentOff, 100),
        repeat: formData.buyXGetYRepeat,
        appliesToCheapest: formData.buyXGetYAppliesToCheapest,
        matchingMode: formData.itemMatchingMode,
      };
    case "nth_item_percentage":
      return {
        itemPosition: parseIntegerField(formData.itemPosition, 2),
        percentOff: parseNumberField(formData.nthPercentOff, 50),
        repeat: formData.nthRepeat,
        appliesToCheapest: formData.nthAppliesToCheapest,
        matchingMode: formData.itemMatchingMode,
      };
    case "volume_discount":
      return {
        matchingMode: formData.itemMatchingMode,
        tiers: formData.volumeTiers.map((tier) => (
          tier.discountType === "percent"
            ? {
                minQuantity: parseIntegerField(tier.minQuantity, 1),
                percentOff: parseNumberField(tier.value, 0),
              }
            : {
                minQuantity: parseIntegerField(tier.minQuantity, 1),
                amountOffPerUnit: parseNumberField(tier.value, 0),
              }
        )),
      };
    case "free_shipping": {
      const config: {
        minQuantity?: number | undefined;
        minSubtotal?: number | undefined;
        shippingMethods: Array<"standard" | "pickup">;
      } = {
        shippingMethods: formData.freeShippingShippingMethods,
      };

      if (formData.freeShippingMinQuantity.trim().length > 0) {
        config.minQuantity = parseIntegerField(formData.freeShippingMinQuantity, 1);
      }

      if (formData.freeShippingMinSubtotal.trim().length > 0) {
        config.minSubtotal = parseNumberField(formData.freeShippingMinSubtotal, 0);
      }

      return config;
    }
    default:
      return {
        buyQuantity: 1,
        getQuantity: 1,
        percentOff: 100,
        repeat: true,
        appliesToCheapest: true,
        matchingMode: "same_product",
      };
  }
}

function buildEditorSummary(formData: PromotionEditorFormState): string {
  switch (formData.ruleType) {
    case "buy_x_get_y":
      return `Compra ${formData.buyQuantity || "0"} y recibe ${formData.getQuantity || "0"} con ${formData.buyXGetYPercentOff || "0"}% de descuento. ${formatMatchingModeSummary(formData.itemMatchingMode)}`;
    case "nth_item_percentage":
      return `La unidad ${formData.itemPosition || "0"} aplica ${formData.nthPercentOff || "0"}% de descuento. ${formatMatchingModeSummary(formData.itemMatchingMode)}`;
    case "volume_discount":
      return `${formData.volumeTiers.length} escala(s) configuradas para descuento por volumen. ${formatMatchingModeSummary(formData.itemMatchingMode)}`;
    case "free_shipping":
      return `Envío gratis para ${formatFreeShippingSummary(formData)}.`;
    default:
      return "Configura los parámetros de la promoción.";
  }
}

function formatFreeShippingSummary(formData: PromotionEditorFormState): string {
  const conditions: string[] = [];
  if (formData.freeShippingMinQuantity.trim().length > 0) {
    conditions.push(`${formData.freeShippingMinQuantity} unidades`);
  }
  if (formData.freeShippingMinSubtotal.trim().length > 0) {
    conditions.push(`subtotal ${formData.freeShippingMinSubtotal}`);
  }
  return conditions.length > 0 ? conditions.join(" o ") : "el checkout seleccionado";
}

function resolveNextPriority(promotions: AdminPromotionItem[]): number {
  return (promotions.reduce((maxValue, promotion) => Math.max(maxValue, promotion.priority), 0) || 0) + 10;
}

function normalizeNullableString(value: string): string | null {
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeDateTimeField(value: string): string | null {
  const normalizedValue = value.trim();
  if (!normalizedValue.length) {
    return null;
  }

  return new Date(normalizedValue).toISOString();
}

function parseIntegerField(value: string, fallback: number): number {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function parseNumberField(value: string, fallback: number): number {
  const parsedValue = Number.parseFloat(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function cloneScope(scope: PromotionScopeSelection): PromotionScopeSelection {
  return {
    productIds: [...scope.productIds],
    categoryIds: [...scope.categoryIds],
    brandIds: [...scope.brandIds],
  };
}

function toDateTimeLocalValue(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offsetMilliseconds = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMilliseconds).toISOString().slice(0, 16);
}

function filterNameReferences<T extends { name: string }>(items: T[], searchValue: string): T[] {
  const normalizedQuery = searchValue.trim().toLocaleLowerCase("es");
  if (!normalizedQuery.length) {
    return items;
  }

  return items.filter((item) => item.name.toLocaleLowerCase("es").includes(normalizedQuery));
}

function filterProductReferences<T extends { name: string; brand: string }>(items: T[], searchValue: string): T[] {
  const normalizedQuery = searchValue.trim().toLocaleLowerCase("es");
  if (!normalizedQuery.length) {
    return items;
  }

  return items.filter((item) => (
    item.name.toLocaleLowerCase("es").includes(normalizedQuery)
    || item.brand.toLocaleLowerCase("es").includes(normalizedQuery)
  ));
}

function editorDescriptionFallback(ruleType: PromotionRuleType): string {
  return ruleLabels[ruleType];
}

function resolvePromotionMatchingModeLabel(promotion: AdminPromotionItem): string {
  if (promotion.ruleType === "free_shipping") {
    return "No aplica";
  }

  const matchingMode = "matchingMode" in promotion.config ? promotion.config.matchingMode : "same_product";
  return matchingMode === "mixed_scope" ? "Mezcla alcance" : "Por producto";
}

function resolvePromotionScopeSummary(promotion: AdminPromotionItem): string {
  return [
    `Productos: ${promotion.scope.productIds.length || "Todos"}`,
    `Categorías: ${promotion.scope.categoryIds.length || "Todas"}`,
    `Marcas: ${promotion.scope.brandIds.length || "Todas"}`,
  ].join(" · ");
}

function StatCard(props: { label: string; value: string; helper: string }) {
  return (
    <div className={ADMIN_INSET_CARD_CLASS_NAME}>
      <p className="text-caption uppercase tracking-[0.12em] text-text-muted">{props.label}</p>
      <p className="mt-2 text-headline-sm text-text-primary">{props.value}</p>
      <p className="text-body-sm text-text-secondary">{props.helper}</p>
    </div>
  );
}

function Chip(props: { children: string; tone: "success" | "neutral" | "brand" | "warning" }) {
  return (
    <span
      className={cx(
        "rounded-full border px-2.5 py-1 text-caption uppercase tracking-[0.12em]",
        props.tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        props.tone === "neutral" && "border-border-soft bg-surface-canvas text-text-muted",
        props.tone === "brand" && "border-border-brand bg-surface-canvas text-text-brand",
        props.tone === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
      )}
    >
      {props.children}
    </span>
  );
}

function SelectField(props: { label: string; description?: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="block text-label-md text-text-primary">{props.label}</span>
      {props.description ? <span className="block text-body-sm text-text-secondary">{props.description}</span> : null}
      <select value={props.value} onChange={(event) => props.onChange(event.target.value)} className={ADMIN_COMPACT_FIELD_CLASS_NAME}>
        {props.children}
      </select>
    </label>
  );
}

function NumberField(props: { label: string; description?: string; value: string; onChange: (value: string) => void; allowEmpty?: boolean }) {
  return (
    <label className="block space-y-2">
      <span className="block text-label-md text-text-primary">{props.label}</span>
      {props.description ? <span className="block text-body-sm text-text-secondary">{props.description}</span> : null}
      <input
        type="number"
        min={0}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        className={ADMIN_COMPACT_FIELD_CLASS_NAME}
        placeholder={props.allowEmpty ? "Opcional" : undefined}
      />
    </label>
  );
}

function DateTimeField(props: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-2">
      <span className="block text-label-md text-text-primary">{props.label}</span>
      <input type="datetime-local" value={props.value} onChange={(event) => props.onChange(event.target.value)} className={ADMIN_COMPACT_FIELD_CLASS_NAME} />
    </label>
  );
}

function ToggleCheckbox(props: { checked: boolean; onChange: (checked: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface-canvas px-4 py-3 text-body-sm text-text-secondary">
      <input type="checkbox" checked={props.checked} onChange={(event) => props.onChange(event.target.checked)} className="h-4 w-4 rounded border-border-default" />
      <span>
        <span className="block text-text-primary">{props.label}</span>
        {props.description ? <span className="block text-text-muted">{props.description}</span> : null}
      </span>
    </label>
  );
}

function RuleHint(props: { children: React.ReactNode }) {
  return (
    <div className="sm:col-span-2 rounded-2xl border border-border-soft bg-surface-canvas px-4 py-3 text-body-sm text-text-secondary">
      {props.children}
    </div>
  );
}

function SelectionSection(props: {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  itemCount: number;
  children: React.ReactNode;
}) {
  return (
    <details open className="h-full min-w-0 rounded-2xl border border-border-soft bg-surface-canvas p-4">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between gap-3">
          <p className="text-label-md text-text-primary">{props.title}</p>
          <span className="rounded-full border border-border-soft px-2.5 py-1 text-caption uppercase tracking-[0.12em] text-text-muted">
            {props.itemCount} seleccionadas
          </span>
        </div>
      </summary>

      <div className="mt-4 space-y-3">
        <input
          value={props.searchValue}
          onChange={(event) => props.onSearchChange(event.target.value)}
          className={ADMIN_COMPACT_FIELD_CLASS_NAME}
          placeholder={props.placeholder}
        />

        <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
          {props.children}
        </div>
      </div>
    </details>
  );
}

function SelectionCheckbox(props: {
  checked: boolean;
  onChange: () => void;
  label: string;
  thumbnailUrl?: string | null;
  thumbnailAlt?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border-soft bg-surface-subtle px-3 py-2.5 text-body-sm text-text-secondary transition-colors hover:border-border-default hover:bg-surface-canvas">
      <input type="checkbox" checked={props.checked} onChange={props.onChange} className="h-4 w-4 rounded border-border-default" />
      {props.thumbnailUrl ? (
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-border-soft bg-surface-canvas">
          <Image src={props.thumbnailUrl} alt={props.thumbnailAlt ?? props.label} fill sizes="40px" className="object-cover" />
        </div>
      ) : null}
      <span className="min-w-0 truncate text-text-primary">{props.label}</span>
    </label>
  );
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatMatchingModeSummary(mode: PromotionItemMatchingMode): string {
  return mode === "same_product"
    ? "Cada producto debe cumplir la cantidad por separado."
    : "Se pueden mezclar productos distintos dentro del alcance.";
}

function buildPreviewCartItem(productId: string): PreviewCartItemState {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `preview-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    productId,
    quantity: "1",
  };
}