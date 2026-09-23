export { IVA_RATE, roundCurrency, splitIvaIncluded } from "@/config/tax";
export type { IvaBreakdown } from "@/config/tax";

import { roundCurrency } from "@/config/tax";

export function formatAmount(value: number): string {
  return roundCurrency(value).toFixed(2);
}
