import "server-only";

import { z } from "zod";

import type {
  AdminPromotionFormData,
  FreeShippingPromotionConfig,
  PromotionConfig,
  PromotionItemMatchingMode,
  PromotionRuleType,
  PromotionScopeSelection,
} from "@/types/admin-promotions";
import type { CheckoutPricingPreviewRequest } from "@/types/checkout-pricing";

const promotionTriggerTypeSchema = z.enum(["automatic", "coupon"]);
const promotionRuleTypeSchema = z.enum(["buy_x_get_y", "nth_item_percentage", "volume_discount", "free_shipping"]);
const promotionStackingModeSchema = z.enum(["exclusive", "stackable"]);
const promotionItemMatchingModeSchema = z.enum(["same_product", "mixed_scope"]);

const identifierListSchema = z.array(z.string().trim().min(1, "Id is required")).default([]);

const currencyAmountSchema = z
  .coerce
  .number()
  .finite("Amount must be a valid number")
  .min(0, "Amount cannot be negative")
  .refine((value) => Number.isInteger(value * 100), "Amount must have at most 2 decimal places");

const strictlyPositiveIntegerSchema = z
  .coerce
  .number()
  .int("Value must be an integer")
  .positive("Value must be greater than 0");

const percentOffSchema = z
  .coerce
  .number()
  .gt(0, "Percent must be greater than 0")
  .lte(100, "Percent must be 100 or less");

const optionalDateTimeSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === "string") {
      const parsedDate = new Date(value);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    return value;
  },
  z.date().nullable(),
);

const buyXGetYConfigSchema = z.object({
  buyQuantity: strictlyPositiveIntegerSchema,
  getQuantity: strictlyPositiveIntegerSchema,
  percentOff: percentOffSchema.default(100),
  repeat: z.boolean().default(true),
  appliesToCheapest: z.boolean().default(true),
  matchingMode: promotionItemMatchingModeSchema.default("same_product"),
});

const nthItemPercentageConfigSchema = z.object({
  itemPosition: strictlyPositiveIntegerSchema.min(2, "Item position must be 2 or greater"),
  percentOff: percentOffSchema.default(50),
  repeat: z.boolean().default(true),
  appliesToCheapest: z.boolean().default(true),
  matchingMode: promotionItemMatchingModeSchema.default("same_product"),
});

const volumeDiscountTierSchema = z.object({
  minQuantity: strictlyPositiveIntegerSchema,
  percentOff: percentOffSchema.optional(),
  amountOffPerUnit: currencyAmountSchema.optional(),
}).superRefine((value, context) => {
  const configuredAdjustments = [value.percentOff, value.amountOffPerUnit].filter((entry) => entry !== undefined);
  if (configuredAdjustments.length !== 1) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["percentOff"],
      message: "Choose either percentOff or amountOffPerUnit for each tier.",
    });
  }
});

const volumeDiscountConfigSchema = z.object({
  tiers: z.array(volumeDiscountTierSchema).min(1, "Define at least one bulk tier."),
  matchingMode: promotionItemMatchingModeSchema.default("same_product"),
}).superRefine((value, context) => {
  const tierKeys = new Set<number>();
  let previousMinQuantity = 0;

  value.tiers.forEach((tier, index) => {
    if (tierKeys.has(tier.minQuantity)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tiers", index, "minQuantity"],
        message: "Tier quantities must be unique.",
      });
    }

    if (tier.minQuantity < previousMinQuantity) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tiers", index, "minQuantity"],
        message: "Tier quantities must be ordered from lowest to highest.",
      });
    }

    tierKeys.add(tier.minQuantity);
    previousMinQuantity = tier.minQuantity;
  });
});

const freeShippingConfigSchema = z.object({
  minQuantity: strictlyPositiveIntegerSchema.optional(),
  minSubtotal: currencyAmountSchema.optional(),
  shippingMethods: z.array(z.enum(["standard", "pickup"]))
    .min(1, "Choose at least one shipping method.")
    .default(["standard"]),
}).superRefine((value, context) => {
  if (value.minQuantity === undefined && value.minSubtotal === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["minQuantity"],
      message: "Free shipping rules require a minQuantity or minSubtotal threshold.",
    });
  }
});

export const promotionScopeSchema = z.object({
  productIds: identifierListSchema,
  categoryIds: identifierListSchema,
  brandIds: identifierListSchema,
}).default({
  productIds: [],
  categoryIds: [],
  brandIds: [],
});

export const adminPromotionFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().max(500, "Description must be 500 characters or less").default(""),
  isActive: z.boolean().default(true),
  triggerType: promotionTriggerTypeSchema.default("automatic"),
  couponCode: z.string().trim().max(64, "Coupon code must be 64 characters or less").nullable().optional(),
  ruleType: promotionRuleTypeSchema,
  stackingMode: promotionStackingModeSchema.default("exclusive"),
  priority: z.coerce.number().int("Priority must be an integer").default(0),
  startsAt: optionalDateTimeSchema.default(null),
  endsAt: optionalDateTimeSchema.default(null),
  scope: promotionScopeSchema,
  config: z.unknown(),
}).superRefine((value, context) => {
  const normalizedCouponCode = normalizeCouponCode(value.couponCode ?? null);
  if (value.triggerType === "coupon" && normalizedCouponCode === null) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["couponCode"],
      message: "Coupon promotions require a couponCode.",
    });
  }

  if (value.triggerType === "automatic" && normalizedCouponCode !== null) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["couponCode"],
      message: "Automatic promotions cannot define a couponCode.",
    });
  }

  if (value.startsAt && value.endsAt && value.startsAt > value.endsAt) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endsAt"],
      message: "endsAt must be later than startsAt.",
    });
  }

  const configResult = getPromotionConfigSchema(value.ruleType).safeParse(value.config);
  if (!configResult.success) {
    for (const issue of configResult.error.issues) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["config", ...issue.path],
        message: issue.message,
      });
    }
  }
});

export const checkoutPricePreviewRequestSchema = z.object({
  items: z.array(z.object({
    productId: z.string().trim().min(1, "productId is required"),
    quantity: strictlyPositiveIntegerSchema,
  })).min(1, "At least one checkout item is required."),
  shippingMethod: z.string().trim().min(1, "shippingMethod is required"),
  couponCode: z.string().trim().max(64, "Coupon code must be 64 characters or less").nullable().optional(),
});

export const adminPromotionPreviewRequestSchema = z.object({
  items: z.array(z.object({
    productId: z.string().trim().min(1, "productId is required"),
    quantity: strictlyPositiveIntegerSchema,
  })).min(1, "At least one preview item is required."),
  shippingMethod: z.string().trim().min(1, "shippingMethod is required"),
  couponCode: z.string().trim().max(64, "Coupon code must be 64 characters or less").nullable().optional(),
  editingPromotionId: z.string().trim().min(1, "editingPromotionId must be a valid id").nullable().optional(),
  promotion: adminPromotionFormSchema,
});

export interface NormalizedAdminPromotionInput {
  name: string;
  description: string | null;
  isActive: boolean;
  triggerType: AdminPromotionFormData["triggerType"];
  couponCode: string | null;
  ruleType: AdminPromotionFormData["ruleType"];
  stackingMode: AdminPromotionFormData["stackingMode"];
  priority: number;
  startsAt: Date | null;
  endsAt: Date | null;
  scope: PromotionScopeSelection;
  config: PromotionConfig;
}

export function resolvePromotionItemMatchingMode(value: unknown): PromotionItemMatchingMode {
  const result = promotionItemMatchingModeSchema.safeParse(value);
  return result.success ? result.data : "same_product";
}

export interface NormalizedAdminPromotionPreviewInput {
  items: CheckoutPricingPreviewRequest["items"];
  shippingMethod: CheckoutPricingPreviewRequest["shippingMethod"];
  couponCode: string | null;
  editingPromotionId: string | null;
  promotion: NormalizedAdminPromotionInput;
}

export function normalizeCouponCode(couponCode: string | null | undefined): string | null {
  const normalizedValue = couponCode?.trim().toUpperCase() ?? "";
  return normalizedValue.length > 0 ? normalizedValue : null;
}

export function parsePromotionConfig(ruleType: PromotionRuleType, value: unknown): PromotionConfig {
  return getPromotionConfigSchema(ruleType).parse(value);
}

export function normalizeAdminPromotionInput(
  input: z.infer<typeof adminPromotionFormSchema>,
): NormalizedAdminPromotionInput {
  return {
    name: input.name.trim(),
    description: input.description.trim().length > 0 ? input.description.trim() : null,
    isActive: input.isActive,
    triggerType: input.triggerType,
    couponCode: normalizeCouponCode(input.couponCode ?? null),
    ruleType: input.ruleType,
    stackingMode: input.stackingMode,
    priority: input.priority,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    scope: {
      productIds: normalizeScopeIds(input.scope.productIds),
      categoryIds: normalizeScopeIds(input.scope.categoryIds),
      brandIds: normalizeScopeIds(input.scope.brandIds),
    },
    config: parsePromotionConfig(input.ruleType, input.config),
  };
}

export function normalizeCheckoutPricePreviewInput(
  input: z.infer<typeof checkoutPricePreviewRequestSchema>,
): CheckoutPricingPreviewRequest {
  return {
    items: normalizeCheckoutItems(input.items),
    shippingMethod: input.shippingMethod,
    couponCode: normalizeCouponCode(input.couponCode ?? null),
  };
}

export function normalizeAdminPromotionPreviewInput(
  input: z.infer<typeof adminPromotionPreviewRequestSchema>,
): NormalizedAdminPromotionPreviewInput {
  return {
    items: normalizeCheckoutItems(input.items),
    shippingMethod: input.shippingMethod,
    couponCode: normalizeCouponCode(input.couponCode ?? null),
    editingPromotionId: input.editingPromotionId?.trim() ?? null,
    promotion: normalizeAdminPromotionInput(input.promotion),
  };
}

export function parseStoredFreeShippingConfig(value: unknown): FreeShippingPromotionConfig {
  return freeShippingConfigSchema.parse(value);
}

function getPromotionConfigSchema(ruleType: PromotionRuleType): z.ZodType<PromotionConfig> {
  switch (ruleType) {
    case "buy_x_get_y":
      return buyXGetYConfigSchema;
    case "nth_item_percentage":
      return nthItemPercentageConfigSchema;
    case "volume_discount":
      return volumeDiscountConfigSchema;
    case "free_shipping":
      return freeShippingConfigSchema;
    default:
      throw new Error(`Unsupported promotion rule type: ${ruleType}`);
  }
}

function normalizeScopeIds(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function normalizeCheckoutItems(items: CheckoutPricingPreviewRequest["items"]): CheckoutPricingPreviewRequest["items"] {
  const quantitiesByProductId = new Map<string, number>();

  for (const item of items) {
    const normalizedProductId = item.productId.trim();
    quantitiesByProductId.set(
      normalizedProductId,
      (quantitiesByProductId.get(normalizedProductId) ?? 0) + item.quantity,
    );
  }

  return [...quantitiesByProductId.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}