import "server-only";

import type { Prisma } from "@prisma/client";

import { CHECKOUT_CURRENCY, resolveCheckoutShippingBaseCost } from "@/config/checkout";
import { resolvePromotionDisplayContent } from "@/lib/promotion-display";
import { prisma } from "@/server/db/prisma";
import { CheckoutPricingError } from "@/server/pricing/pricing.errors";
import {
  parsePromotionConfig,
  type NormalizedAdminPromotionInput,
} from "@/server/pricing/promotion.schemas";
import {
  listActivePromotionRecords,
  type PromotionRecord,
} from "@/server/pricing/promotion.repository";
import type {
  BuyXGetYPromotionConfig,
  NthItemPercentagePromotionConfig,
  PromotionConfig,
  PromotionItemMatchingMode,
  VolumeDiscountPromotionConfig,
  VolumeDiscountTier,
} from "@/types/admin-promotions";
import type {
  CheckoutPricingAdjustment,
  CheckoutPricingLine,
  CheckoutPricingPreview,
  CheckoutPricingPreviewRequest,
} from "@/types/checkout-pricing";

interface DecimalLike {
  toNumber(): number;
}

interface PricingLineState {
  productId: string;
  productName: string;
  brandId: string | null;
  brandName: string;
  categoryIds: string[];
  quantity: number;
  baseUnitPrice: number;
  baseSubtotal: number;
  currentSubtotal: number;
  discountTotal: number;
  adjustments: CheckoutPricingAdjustment[];
  hasExclusivePromotion: boolean;
}

interface ShippingState {
  base: number;
  current: number;
  discountTotal: number;
  hasExclusivePromotion: boolean;
}

interface EligibleUnit {
  lineIndex: number;
  unitPrice: number;
}

const pricingProductSelect = {
  id: true,
  name: true,
  brand: true,
  brandId: true,
  price: true,
  discountPrice: true,
  stock: true,
  isActive: true,
  categoryId: true,
  categoryAssignments: {
    select: {
      categoryId: true,
    },
    orderBy: {
      position: "asc",
    },
  },
} satisfies Prisma.ProductSelect;

type PricingProductRecord = Prisma.ProductGetPayload<{
  select: typeof pricingProductSelect;
}>;

interface CalculablePromotion {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  triggerType: PromotionRecord["triggerType"];
  couponCode: string | null;
  ruleType: PromotionRecord["ruleType"];
  stackingMode: PromotionRecord["stackingMode"];
  priority: number;
  startsAt: Date | null;
  endsAt: Date | null;
  config: PromotionRecord["config"];
  productScopes: PromotionRecord["productScopes"];
  categoryScopes: PromotionRecord["categoryScopes"];
  brandScopes: PromotionRecord["brandScopes"];
  createdAt: Date;
  updatedAt: Date;
}

interface BuildCheckoutPricingPreviewOptions {
  draftPromotion?: NormalizedAdminPromotionInput | null;
  excludePromotionIds?: string[];
}

export async function buildCheckoutPricingPreview(
  input: CheckoutPricingPreviewRequest,
  options: BuildCheckoutPricingPreviewOptions = {},
): Promise<CheckoutPricingPreview> {
  const now = new Date();
  const shippingBase = await resolveShippingCostFromDb(input.shippingMethod);
  const cartItems = normalizeCheckoutItems(input.items);
  const products = await loadProductsForPricing(cartItems);
  const lines = buildLineStates(cartItems, products);
  const shipping = createShippingState(shippingBase);
  const appliedPromotionMap = new Map<string, CheckoutPricingAdjustment>();
  const excludedPromotionIds = new Set(options.excludePromotionIds ?? []);
  const availablePromotions: CalculablePromotion[] = (await listActivePromotionRecords())
    .filter((promotion) => !excludedPromotionIds.has(promotion.id))
    .filter((promotion) => isPromotionWithinActiveWindow(promotion, now));

  if (options.draftPromotion) {
    const draftPromotion = createDraftCalculablePromotion(options.draftPromotion);
    if (isPromotionWithinActiveWindow(draftPromotion, now)) {
      availablePromotions.push(draftPromotion);
    }
  }

  availablePromotions.sort((left, right) => {
    if (left.priority !== right.priority) {
      return right.priority - left.priority;
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });

  const normalizedCouponCode = input.couponCode?.trim().toUpperCase() ?? null;
  const matchedCouponPromotions = normalizedCouponCode
    ? availablePromotions.filter(
        (promotion) =>
          promotion.triggerType === "coupon" && promotion.couponCode?.toUpperCase() === normalizedCouponCode,
      )
    : [];

  const candidatePromotions = availablePromotions.filter((promotion) => {
    if (promotion.triggerType === "automatic") {
      return true;
    }

    return matchedCouponPromotions.some((matchedPromotion) => matchedPromotion.id === promotion.id);
  });

  const itemPromotions = candidatePromotions.filter((promotion) => promotion.ruleType !== "free_shipping");
  const shippingPromotions = candidatePromotions.filter((promotion) => promotion.ruleType === "free_shipping");

  for (const promotion of itemPromotions) {
    applyItemPromotion({
      promotion,
      lines,
      appliedPromotionMap,
    });
  }

  for (const promotion of shippingPromotions) {
    applyShippingPromotion({
      promotion,
      lines,
      shipping,
      shippingMethod: input.shippingMethod,
      appliedPromotionMap,
    });
  }

  const previewLines = lines.map<CheckoutPricingLine>((line) => ({
    productId: line.productId,
    productName: line.productName,
    brandName: line.brandName,
    quantity: line.quantity,
    baseUnitPrice: line.baseUnitPrice,
    finalUnitPrice: roundCurrency(line.currentSubtotal / line.quantity),
    baseSubtotal: line.baseSubtotal,
    discountTotal: line.discountTotal,
    finalSubtotal: line.currentSubtotal,
    adjustments: line.adjustments,
  }));

  const merchandiseSubtotal = roundCurrency(lines.reduce((sum, line) => sum + line.baseSubtotal, 0));
  const merchandiseDiscountTotal = roundCurrency(lines.reduce((sum, line) => sum + line.discountTotal, 0));
  const shippingDiscount = roundCurrency(shipping.discountTotal);
  const shippingTotal = roundCurrency(shipping.current);
  const total = roundCurrency(merchandiseSubtotal - merchandiseDiscountTotal + shippingTotal);
  const invalidCouponCode = normalizedCouponCode && matchedCouponPromotions.length === 0
    ? normalizedCouponCode
    : null;

  return {
    currency: CHECKOUT_CURRENCY,
    couponCode: normalizedCouponCode,
    invalidCouponCode,
    lines: previewLines,
    appliedPromotions: [...appliedPromotionMap.values()],
    totals: {
      totalItemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      merchandiseSubtotal,
      discountTotal: merchandiseDiscountTotal,
      shippingBase: roundCurrency(shipping.base),
      shippingDiscount,
      shippingTotal,
      total,
    },
  };
}

function normalizeCheckoutItems(items: CheckoutPricingPreviewRequest["items"]): CheckoutPricingPreviewRequest["items"] {
  const quantitiesByProductId = new Map<string, number>();

  for (const item of items) {
    quantitiesByProductId.set(item.productId, (quantitiesByProductId.get(item.productId) ?? 0) + item.quantity);
  }

  return [...quantitiesByProductId.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

function extractBaseProductId(productId: string): string {
  const separatorIndex = productId.indexOf("__");
  return separatorIndex === -1 ? productId : productId.substring(0, separatorIndex);
}

async function loadProductsForPricing(
  items: CheckoutPricingPreviewRequest["items"],
): Promise<Map<string, PricingProductRecord>> {
  const productIds = [...new Set(items.map((item) => extractBaseProductId(item.productId)))];
  const records = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: pricingProductSelect,
  });

  if (records.length < productIds.length) {
    throw new CheckoutPricingError(
      "PRODUCT_NOT_FOUND",
      "One or more products in the checkout request no longer exist.",
      404,
    );
  }

  const productsById = new Map(records.map((record) => [record.id, record]));

  for (const item of items) {
    const baseId = extractBaseProductId(item.productId);
    const product = productsById.get(baseId);
    if (!product) {
      throw new CheckoutPricingError(
        "PRODUCT_NOT_FOUND",
        "One or more products in the checkout request no longer exist.",
        404,
      );
    }

    if (!product.isActive) {
      throw new CheckoutPricingError(
        "PRODUCT_NOT_AVAILABLE",
        `The product '${product.name}' is not available for checkout.`,
      );
    }

    if (item.quantity > product.stock) {
      throw new CheckoutPricingError(
        "INSUFFICIENT_STOCK",
        `The requested quantity for '${product.name}' exceeds current stock.`,
      );
    }
  }

  return productsById;
}

function buildLineStates(
  items: CheckoutPricingPreviewRequest["items"],
  productsById: Map<string, PricingProductRecord>,
): PricingLineState[] {
  return items.map((item) => {
    const baseId = extractBaseProductId(item.productId);
    const product = productsById.get(baseId);
    if (!product) {
      throw new CheckoutPricingError(
        "PRODUCT_NOT_FOUND",
        "One or more products in the checkout request no longer exist.",
        404,
      );
    }

    const baseUnitPrice = resolveProductBaseUnitPrice(product);
    const baseSubtotal = roundCurrency(baseUnitPrice * item.quantity);
    const categoryIds = new Set<string>();

    if (product.categoryId) {
      categoryIds.add(product.categoryId);
    }

    for (const assignment of product.categoryAssignments) {
      categoryIds.add(assignment.categoryId);
    }

    return {
      productId: product.id,
      productName: product.name,
      brandId: product.brandId,
      brandName: product.brand,
      categoryIds: [...categoryIds],
      quantity: item.quantity,
      baseUnitPrice,
      baseSubtotal,
      currentSubtotal: baseSubtotal,
      discountTotal: 0,
      adjustments: [],
      hasExclusivePromotion: false,
    };
  });
}

async function resolveShippingCostFromDb(shippingMethodType: string): Promise<number> {
  const method = await prisma.shippingMethod.findFirst({
    where: { type: shippingMethodType, isActive: true },
    select: { price: true },
  });
  if (method) {
    return (method.price as DecimalLike).toNumber();
  }
  return resolveCheckoutShippingBaseCost(shippingMethodType);
}

function createShippingState(base: number): ShippingState {
  return {
    base: roundCurrency(base),
    current: roundCurrency(base),
    discountTotal: 0,
    hasExclusivePromotion: false,
  };
}

function applyItemPromotion(input: {
  promotion: CalculablePromotion;
  lines: PricingLineState[];
  appliedPromotionMap: Map<string, CheckoutPricingAdjustment>;
}): void {
  const config = parsePromotionConfig(input.promotion.ruleType, input.promotion.config);
  const eligibleLineGroups = resolveEligibleLineGroups(input.promotion, input.lines, config);
  if (eligibleLineGroups.length === 0) {
    return;
  }

  let description = input.promotion.name;
  const displayContent = resolvePromotionDisplayContent(input.promotion.ruleType, config);

  for (const eligibleLineIndices of eligibleLineGroups) {
    if (eligibleLineIndices.length === 0) {
      continue;
    }

    if (input.promotion.stackingMode === "exclusive" && eligibleLineIndices.some((index) => input.lines[index]?.hasExclusivePromotion)) {
      continue;
    }

    let discountByLine = new Map<number, number>();

    switch (input.promotion.ruleType) {
      case "buy_x_get_y":
        discountByLine = buildBuyXGetYDiscountMap(input.lines, eligibleLineIndices, config as BuyXGetYPromotionConfig);
        description = describeBuyXGetYPromotion(config as BuyXGetYPromotionConfig);
        break;
      case "nth_item_percentage":
        discountByLine = buildNthItemDiscountMap(input.lines, eligibleLineIndices, config as NthItemPercentagePromotionConfig);
        description = describeNthItemPromotion(config as NthItemPercentagePromotionConfig);
        break;
      case "volume_discount":
        discountByLine = buildVolumeDiscountMap(input.lines, eligibleLineIndices, config as VolumeDiscountPromotionConfig);
        description = describeVolumePromotion(config as VolumeDiscountPromotionConfig);
        break;
      case "free_shipping":
        return;
      default:
        return;
    }

    applyLineDiscounts({
      promotion: input.promotion,
      description,
      shortLabel: displayContent.shortLabel,
      badgeParts: displayContent.badgeParts,
      discountByLine,
      lines: input.lines,
      appliedPromotionMap: input.appliedPromotionMap,
    });
  }
}

function applyShippingPromotion(input: {
  promotion: CalculablePromotion;
  lines: PricingLineState[];
  shipping: ShippingState;
  shippingMethod: CheckoutPricingPreviewRequest["shippingMethod"];
  appliedPromotionMap: Map<string, CheckoutPricingAdjustment>;
}): void {
  if (input.promotion.stackingMode === "exclusive" && input.shipping.hasExclusivePromotion) {
    return;
  }

  const config = parsePromotionConfig(input.promotion.ruleType, input.promotion.config);
  if (input.promotion.ruleType !== "free_shipping") {
    return;
  }

  const eligibleLineIndices = resolveEligibleLineIndices(input.promotion, input.lines);
  if (eligibleLineIndices.length === 0) {
    return;
  }

  const shippingDiscount = calculateFreeShippingDiscount({
    config,
    lines: input.lines,
    eligibleLineIndices,
    shippingMethod: input.shippingMethod,
    shippingState: input.shipping,
  });

  if (shippingDiscount <= 0) {
    return;
  }

  const appliedAmount = Math.min(input.shipping.current, shippingDiscount);
  if (appliedAmount <= 0) {
    return;
  }

  input.shipping.current = roundCurrency(input.shipping.current - appliedAmount);
  input.shipping.discountTotal = roundCurrency(input.shipping.discountTotal + appliedAmount);
  if (input.promotion.stackingMode === "exclusive") {
    input.shipping.hasExclusivePromotion = true;
  }

  accumulateAppliedPromotion(
    input.appliedPromotionMap,
    input.promotion,
    roundCurrency(appliedAmount),
    resolvePromotionDisplayContent(input.promotion.ruleType, config).shortLabel,
    resolvePromotionDisplayContent(input.promotion.ruleType, config).badgeParts,
    describeFreeShippingPromotion(),
  );
}

function buildBuyXGetYDiscountMap(
  lines: PricingLineState[],
  eligibleLineIndices: number[],
  config: BuyXGetYPromotionConfig,
): Map<number, number> {
  const groupSize = config.buyQuantity + config.getQuantity;
  const totalEligibleQuantity = sumLineQuantities(lines, eligibleLineIndices);
  const eligibleGroups = config.repeat
    ? Math.floor(totalEligibleQuantity / groupSize)
    : totalEligibleQuantity >= groupSize ? 1 : 0;

  if (eligibleGroups <= 0) {
    return new Map();
  }

  const discountedUnitCount = eligibleGroups * config.getQuantity;
  const eligibleUnits = buildEligibleUnits(lines, eligibleLineIndices, config.appliesToCheapest);
  return distributeUnitDiscounts(eligibleUnits.slice(0, discountedUnitCount), config.percentOff);
}

function buildNthItemDiscountMap(
  lines: PricingLineState[],
  eligibleLineIndices: number[],
  config: NthItemPercentagePromotionConfig,
): Map<number, number> {
  const totalEligibleQuantity = sumLineQuantities(lines, eligibleLineIndices);
  const discountGroups = config.repeat
    ? Math.floor(totalEligibleQuantity / config.itemPosition)
    : totalEligibleQuantity >= config.itemPosition ? 1 : 0;

  if (discountGroups <= 0) {
    return new Map();
  }

  const eligibleUnits = buildEligibleUnits(lines, eligibleLineIndices, config.appliesToCheapest);
  return distributeUnitDiscounts(eligibleUnits.slice(0, discountGroups), config.percentOff);
}

function buildVolumeDiscountMap(
  lines: PricingLineState[],
  eligibleLineIndices: number[],
  config: VolumeDiscountPromotionConfig,
): Map<number, number> {
  const totalEligibleQuantity = sumLineQuantities(lines, eligibleLineIndices);
  const eligibleTier = resolveEligibleVolumeTier(config.tiers, totalEligibleQuantity);
  if (!eligibleTier) {
    return new Map();
  }

  const discountByLine = new Map<number, number>();
  for (const lineIndex of eligibleLineIndices) {
    const line = lines[lineIndex];
    if (!line || line.currentSubtotal <= 0) {
      continue;
    }

    const rawDiscount = eligibleTier.percentOff !== undefined
      ? line.currentSubtotal * (eligibleTier.percentOff / 100)
      : line.quantity * (eligibleTier.amountOffPerUnit ?? 0);
    const cappedDiscount = Math.min(line.currentSubtotal, rawDiscount);

    if (cappedDiscount > 0) {
      discountByLine.set(lineIndex, roundCurrency(cappedDiscount));
    }
  }

  return discountByLine;
}

function calculateFreeShippingDiscount(input: {
  config: PromotionConfig;
  lines: PricingLineState[];
  eligibleLineIndices: number[];
  shippingMethod: CheckoutPricingPreviewRequest["shippingMethod"];
  shippingState: ShippingState;
}): number {
  const config = input.config as Extract<PromotionConfig, { shippingMethods: string[] }>;
  if (!config.shippingMethods.includes(input.shippingMethod)) {
    return 0;
  }

  const totalEligibleQuantity = sumLineQuantities(input.lines, input.eligibleLineIndices);
  const eligibleMerchandiseTotal = roundCurrency(
    input.eligibleLineIndices.reduce((sum, lineIndex) => sum + (input.lines[lineIndex]?.currentSubtotal ?? 0), 0),
  );

  if (config.minQuantity !== undefined && totalEligibleQuantity < config.minQuantity) {
    return 0;
  }

  if (config.minSubtotal !== undefined && eligibleMerchandiseTotal < config.minSubtotal) {
    return 0;
  }

  return input.shippingState.current;
}

function applyLineDiscounts(input: {
  promotion: CalculablePromotion;
  description: string;
  shortLabel: string;
  badgeParts: string[];
  discountByLine: Map<number, number>;
  lines: PricingLineState[];
  appliedPromotionMap: Map<string, CheckoutPricingAdjustment>;
}): void {
  let promotionTotal = 0;

  for (const [lineIndex, rawDiscount] of input.discountByLine.entries()) {
    const line = input.lines[lineIndex];
    if (!line || rawDiscount <= 0) {
      continue;
    }

    const cappedDiscount = roundCurrency(Math.min(line.currentSubtotal, rawDiscount));
    if (cappedDiscount <= 0) {
      continue;
    }

    line.currentSubtotal = roundCurrency(line.currentSubtotal - cappedDiscount);
    line.discountTotal = roundCurrency(line.discountTotal + cappedDiscount);
    line.adjustments.push({
      promotionId: input.promotion.id,
      promotionName: input.promotion.name,
      ruleType: input.promotion.ruleType,
      triggerType: input.promotion.triggerType,
      amount: cappedDiscount,
      shortLabel: input.shortLabel,
      badgeParts: input.badgeParts,
      description: input.description,
    });

    if (input.promotion.stackingMode === "exclusive") {
      line.hasExclusivePromotion = true;
    }

    promotionTotal = roundCurrency(promotionTotal + cappedDiscount);
  }

  if (promotionTotal > 0) {
    accumulateAppliedPromotion(
      input.appliedPromotionMap,
      input.promotion,
      promotionTotal,
      input.shortLabel,
      input.badgeParts,
      input.description,
    );
  }
}

function accumulateAppliedPromotion(
  appliedPromotionMap: Map<string, CheckoutPricingAdjustment>,
  promotion: CalculablePromotion,
  amount: number,
  shortLabel: string,
  badgeParts: string[],
  description: string,
): void {
  const existingPromotion = appliedPromotionMap.get(promotion.id);
  if (existingPromotion) {
    existingPromotion.amount = roundCurrency(existingPromotion.amount + amount);
    appliedPromotionMap.set(promotion.id, existingPromotion);
    return;
  }

  appliedPromotionMap.set(promotion.id, {
    promotionId: promotion.id,
    promotionName: promotion.name,
    ruleType: promotion.ruleType,
    triggerType: promotion.triggerType,
    amount: roundCurrency(amount),
    shortLabel,
    badgeParts,
    description,
  });
}

function resolveEligibleLineIndices(promotion: CalculablePromotion, lines: PricingLineState[]): number[] {
  const productScopeIds = new Set(promotion.productScopes.map((entry) => entry.productId));
  const categoryScopeIds = new Set(promotion.categoryScopes.map((entry) => entry.categoryId));
  const brandScopeIds = new Set(promotion.brandScopes.map((entry) => entry.brandId));
  const hasScopedEntities = productScopeIds.size > 0 || categoryScopeIds.size > 0 || brandScopeIds.size > 0;

  if (!hasScopedEntities) {
    return lines.map((_, index) => index);
  }

  return lines.flatMap((line, index) => {
    const matchesProductScope = productScopeIds.has(line.productId);
    const matchesBrandScope = line.brandId !== null && brandScopeIds.has(line.brandId);
    const matchesCategoryScope = line.categoryIds.some((categoryId) => categoryScopeIds.has(categoryId));

    return matchesProductScope || matchesBrandScope || matchesCategoryScope ? [index] : [];
  });
}

function resolveEligibleLineGroups(
  promotion: CalculablePromotion,
  lines: PricingLineState[],
  config: PromotionConfig,
): number[][] {
  const eligibleLineIndices = resolveEligibleLineIndices(promotion, lines);
  if (eligibleLineIndices.length === 0) {
    return [];
  }

  if (promotion.ruleType === "free_shipping") {
    return [eligibleLineIndices];
  }

  const matchingMode = resolveItemMatchingMode(config);
  if (matchingMode === "mixed_scope") {
    return [eligibleLineIndices];
  }

  const groupsByProductId = new Map<string, number[]>();
  for (const lineIndex of eligibleLineIndices) {
    const line = lines[lineIndex];
    if (!line) {
      continue;
    }

    const existingGroup = groupsByProductId.get(line.productId) ?? [];
    existingGroup.push(lineIndex);
    groupsByProductId.set(line.productId, existingGroup);
  }

  return [...groupsByProductId.values()];
}

function resolveItemMatchingMode(config: PromotionConfig): PromotionItemMatchingMode {
  if (typeof config !== "object" || config === null || !("matchingMode" in config)) {
    return "same_product";
  }

  return config.matchingMode === "mixed_scope" ? "mixed_scope" : "same_product";
}

function buildEligibleUnits(
  lines: PricingLineState[],
  eligibleLineIndices: number[],
  sortByCheapest: boolean,
): EligibleUnit[] {
  const units: EligibleUnit[] = [];

  for (const lineIndex of eligibleLineIndices) {
    const line = lines[lineIndex];
    if (!line || line.quantity <= 0 || line.currentSubtotal <= 0) {
      continue;
    }

    const currentUnitPrice = roundCurrency(line.currentSubtotal / line.quantity);
    for (let quantityIndex = 0; quantityIndex < line.quantity; quantityIndex += 1) {
      units.push({
        lineIndex,
        unitPrice: currentUnitPrice,
      });
    }
  }

  if (!sortByCheapest) {
    return units;
  }

  return units.sort((left, right) => {
    if (left.unitPrice !== right.unitPrice) {
      return left.unitPrice - right.unitPrice;
    }

    return left.lineIndex - right.lineIndex;
  });
}

function distributeUnitDiscounts(units: EligibleUnit[], percentOff: number): Map<number, number> {
  const discountByLine = new Map<number, number>();

  for (const unit of units) {
    const unitDiscount = roundCurrency(unit.unitPrice * (percentOff / 100));
    if (unitDiscount <= 0) {
      continue;
    }

    discountByLine.set(unit.lineIndex, roundCurrency((discountByLine.get(unit.lineIndex) ?? 0) + unitDiscount));
  }

  return discountByLine;
}

function resolveEligibleVolumeTier(tiers: VolumeDiscountTier[], quantity: number): VolumeDiscountTier | null {
  const orderedTiers = [...tiers].sort((left, right) => left.minQuantity - right.minQuantity);
  let matchedTier: VolumeDiscountTier | null = null;

  for (const tier of orderedTiers) {
    if (quantity >= tier.minQuantity) {
      matchedTier = tier;
    }
  }

  return matchedTier;
}

function sumLineQuantities(lines: PricingLineState[], lineIndices: number[]): number {
  return lineIndices.reduce((sum, index) => sum + (lines[index]?.quantity ?? 0), 0);
}

function isPromotionWithinActiveWindow(promotion: CalculablePromotion, now: Date): boolean {
  if (promotion.startsAt && promotion.startsAt > now) {
    return false;
  }

  if (promotion.endsAt && promotion.endsAt < now) {
    return false;
  }

  return true;
}

function resolveProductBaseUnitPrice(product: PricingProductRecord): number {
  const price = toNumberValue(product.price);
  const discountPrice = toNumberValue(product.discountPrice);

  if (discountPrice !== null && discountPrice > 0 && discountPrice < price) {
    return roundCurrency(discountPrice);
  }

  return roundCurrency(price);
}

function toNumberValue(value: number | DecimalLike | null): number {
  if (value === null) {
    return 0;
  }

  return typeof value === "number" ? value : value.toNumber();
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function describeBuyXGetYPromotion(config: BuyXGetYPromotionConfig): string {
  if (config.percentOff === 100 && config.getQuantity === 1) {
    const totalUnits = config.buyQuantity + config.getQuantity;
    return `${totalUnits}x${config.buyQuantity}`;
  }

  return `Compra ${config.buyQuantity} y obtén ${config.getQuantity} con ${config.percentOff}% de descuento`;
}

function describeNthItemPromotion(config: NthItemPercentagePromotionConfig): string {
  return `La unidad ${config.itemPosition} lleva ${config.percentOff}% de descuento`;
}

function describeVolumePromotion(config: VolumeDiscountPromotionConfig): string {
  const highestTier = resolveEligibleVolumeTier(config.tiers, Number.MAX_SAFE_INTEGER) ?? config.tiers[config.tiers.length - 1];
  if (highestTier?.percentOff !== undefined) {
    return `Descuento por volumen hasta ${highestTier.percentOff}%`;
  }

  return "Descuento por volumen";
}

function describeFreeShippingPromotion(): string {
  return "Envío gratis";
}

function createDraftCalculablePromotion(input: NormalizedAdminPromotionInput): CalculablePromotion {
  const timestamp = new Date();
  return {
    id: "draft-promotion-preview",
    name: input.name,
    description: input.description,
    isActive: true,
    triggerType: input.triggerType,
    couponCode: input.couponCode,
    ruleType: input.ruleType,
    stackingMode: input.stackingMode,
    priority: input.priority,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    config: input.config as unknown as Prisma.JsonValue,
    productScopes: input.scope.productIds.map((productId) => ({
      promotionId: "draft-promotion-preview",
      productId,
      createdAt: timestamp,
    })),
    categoryScopes: input.scope.categoryIds.map((categoryId) => ({
      promotionId: "draft-promotion-preview",
      categoryId,
      createdAt: timestamp,
    })),
    brandScopes: input.scope.brandIds.map((brandId) => ({
      promotionId: "draft-promotion-preview",
      brandId,
      createdAt: timestamp,
    })),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}