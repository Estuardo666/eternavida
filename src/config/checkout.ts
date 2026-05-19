export type CheckoutShippingMethod = string;

export const CHECKOUT_CURRENCY = "USD";

// Fallback costs used only when the DB method cannot be resolved (e.g. legacy promotions preview).
export const CHECKOUT_SHIPPING_BASE_COSTS: Record<string, number> = {
  standard: 6,
  pickup: 0,
};

export function resolveCheckoutShippingBaseCost(method: CheckoutShippingMethod): number {
  return CHECKOUT_SHIPPING_BASE_COSTS[method] ?? 0;
}