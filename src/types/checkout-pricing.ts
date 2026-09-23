import type { CheckoutShippingMethod } from "@/config/checkout";
import type { PromotionRuleType, PromotionTriggerType } from "@/types/admin-promotions";

export interface CheckoutPricingPreviewRequestItem {
  productId: string;
  quantity: number;
}

export interface CheckoutPricingPreviewRequest {
  items: CheckoutPricingPreviewRequestItem[];
  shippingMethod: CheckoutShippingMethod;
  couponCode?: string | null;
}

export interface CheckoutPricingAdjustment {
  promotionId: string;
  promotionName: string;
  ruleType: PromotionRuleType;
  triggerType: PromotionTriggerType;
  amount: number;
  shortLabel: string;
  badgeParts: string[];
  description: string;
}

export interface CheckoutPricingLine {
  productId: string;
  productName: string;
  brandName: string;
  quantity: number;
  baseUnitPrice: number;
  finalUnitPrice: number;
  baseSubtotal: number;
  discountTotal: number;
  finalSubtotal: number;
  adjustments: CheckoutPricingAdjustment[];
}

export interface CheckoutPricingTotals {
  totalItemCount: number;
  merchandiseSubtotal: number;
  discountTotal: number;
  shippingBase: number;
  shippingDiscount: number;
  shippingTotal: number;
  total: number;
}

export interface CheckoutPricingPreview {
  currency: string;
  couponCode: string | null;
  invalidCouponCode: string | null;
  lines: CheckoutPricingLine[];
  appliedPromotions: CheckoutPricingAdjustment[];
  totals: CheckoutPricingTotals;
}

export interface CheckoutPricingPreviewRouteResponse {
  success: boolean;
  data?: {
    preview: CheckoutPricingPreview;
  };
  error?: {
    code: string;
    message: string;
    details?: {
      missingProductIds?: string[];
    };
  };
  timestamp: string;
}