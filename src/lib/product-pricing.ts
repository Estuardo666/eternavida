import type { Prisma } from "@prisma/client";

export function computeDiscountPercent(price: Prisma.Decimal | number, discountPrice: Prisma.Decimal | number | null): number {
  const p = typeof price === "number" ? price : price.toNumber();
  const dp = discountPrice === null ? null : typeof discountPrice === "number" ? discountPrice : discountPrice.toNumber();

  if (!Number.isFinite(p) || p <= 0 || dp === null || !Number.isFinite(dp) || dp >= p) {
    return 0;
  }

  return Math.round(((p - dp) / p) * 10000) / 100;
}