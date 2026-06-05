export const ABANDONED_CART_STATUSES = ["active", "recovered", "expired"] as const;

export type AbandonedCartStatus = (typeof ABANDONED_CART_STATUSES)[number];

export type AbandonedCartStep = {
  delayHours: number;
  subject: string;
  template: string;
};

export type AbandonedCartSettingsData = {
  id: string;
  isEnabled: boolean;
  steps: AbandonedCartStep[];
  maxRecoverySteps: number;
  includeDiscount: boolean;
  discountPercent: number | null;
  couponPrefix: string | null;
};

export type CartDataItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  discountPrice: number | null;
  quantity: number;
  imageUrl: string | null;
};

export type AbandonedCartListItem = {
  id: string;
  clerkUserId: string | null;
  guestEmail: string | null;
  cartData: CartDataItem[];
  status: AbandonedCartStatus;
  lastActivityAt: string;
  recoveryStep: number;
  recoveredAt: string | null;
  createdAt: string;
};
