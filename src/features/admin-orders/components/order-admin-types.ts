export const ORDER_STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUS_OPTIONS)[number];

export const PAYMENT_STATUS_OPTIONS = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
] as const;

export type PaymentStatusValue = (typeof PAYMENT_STATUS_OPTIONS)[number];
export type OrderNoteVisibilityValue = "internal" | "customer";
export type WebhookEventStatusValue = "pending" | "delivered" | "failed" | "retrying";

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  processing: "En proceso",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export const ORDER_STATUS_CLASS_NAMES: Record<OrderStatusValue, string> = {
  pending: "border-[#d9d0a3] bg-[#faf7e8] text-[#7a6830]",
  confirmed: "border-[#c8dcbf] bg-[#eef8ea] text-[#2f6d44]",
  processing: "border-[#ead6bb] bg-[#fcf4ea] text-[#8b5a1e]",
  shipped: "border-[#c8d7ef] bg-[#eef4fc] text-[#2d5fa7]",
  delivered: "border-[#bdd9ca] bg-[#e9f5ee] text-[#1f6a4d]",
  cancelled: "border-[#efc4c4] bg-[#fff3f3] text-status-error",
  refunded: "border-[#d8cdee] bg-[#f7f2fd] text-[#6f46b6]",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatusValue, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  failed: "Fallido",
  refunded: "Reembolsado",
  partially_refunded: "Reembolso parcial",
};

export const PAYMENT_STATUS_CLASS_NAMES: Record<PaymentStatusValue, string> = {
  pending: "border-[#d9d0a3] bg-[#faf7e8] text-[#7a6830]",
  paid: "border-[#c8dcbf] bg-[#eef8ea] text-[#2f6d44]",
  failed: "border-[#efc4c4] bg-[#fff3f3] text-status-error",
  refunded: "border-[#c8d7ef] bg-[#eef4fc] text-[#2d5fa7]",
  partially_refunded: "border-[#ead6bb] bg-[#fcf4ea] text-[#8b5a1e]",
};

export type OrderItemRecord = {
  id: string;
  productId: string | null;
  name: string;
  brand: string;
  price: string;
  discountPrice: string | null;
  quantity: number;
  imageUrl: string | null;
};

export type OrderNoteRecord = {
  id: string;
  content: string;
  visibility: OrderNoteVisibilityValue;
  createdBy: string | null;
  createdAt: string;
};

export type OrderTimelineRecord = {
  id: string;
  eventType: string;
  description: string;
  metadata: Record<string, unknown> | null;
  createdBy: string | null;
  createdAt: string;
};

export type WebhookEventRecord = {
  id: string;
  eventType: string;
  status: WebhookEventStatusValue;
  attemptCount: number;
  lastAttemptAt: string | null;
  lastResponseStatus: number | null;
  lastResponseBody: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminOrderRecord = {
  id: string;
  orderNumber: string;
  clerkUserId: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  status: OrderStatusValue;
  paymentStatus: PaymentStatusValue;
  trackingNumber: string | null;
  trackingUrl: string | null;
  source: "web" | "api" | "manual";
  externalOrderId: string | null;
  syncedAt: string | null;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string | null;
  province: string;
  city: string;
  phone: string;
  idNumber: string | null;
  shippingMethodId: string | null;
  shippingMethodName: string;
  paymentMethodId: string | null;
  paymentMethodName: string;
  couponCode: string | null;
  subtotal: string;
  shippingCost: string;
  discountAmount: string;
  taxAmount: string;
  total: string;
  checkoutNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemRecord[];
  notes: OrderNoteRecord[];
  timeline: OrderTimelineRecord[];
  webhookEvents: WebhookEventRecord[];
};

export type OrderDashboardSummary = {
  count: number;
  revenue: number;
  previous: {
    count: number;
    revenue: number;
  };
};

export type OrderDashboardStatsData = {
  today: OrderDashboardSummary;
  week: OrderDashboardSummary;
  month: OrderDashboardSummary;
  statusBreakdown: Record<string, number>;
  dailyRevenue: Array<{ date: string; revenue: number }>;
  paymentMethodBreakdown: Array<{
    paymentMethodName: string;
    count: number;
    revenue: number;
  }>;
};
