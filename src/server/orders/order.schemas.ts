import {
  OrderNoteVisibility,
  OrderSource,
  OrderStatus,
  PaymentStatus,
} from "@prisma/client";
import { z } from "zod";

const decimalValueSchema = z.string().or(z.number());

const optionalUrlSchema = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || z.url().safeParse(value).success, {
    message: "Debe ser una URL valida.",
  })
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .optional();

export const orderItemSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(1),
  brand: z.string().min(1),
  price: decimalValueSchema,
  discountPrice: decimalValueSchema.optional().nullable(),
  quantity: z.number().int().positive(),
  imageUrl: z.string().optional().nullable(),
});

export const orderAddressSchema = z
  .object({
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    address: z.string().trim().min(1).optional(),
    apartment: z.string().trim().nullable().optional(),
    province: z.string().trim().min(1).optional(),
    city: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(1).optional(),
    idNumber: z.string().trim().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Se requiere al menos un campo de direccion.",
  });

export const orderTrackingSchema = z.object({
  trackingNumber: z.string().trim().min(1).nullable().optional(),
  trackingUrl: optionalUrlSchema,
});

export const orderNoteInputSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  visibility: z.nativeEnum(OrderNoteVisibility).default(OrderNoteVisibility.internal),
});

export const resendOrderEmailSchema = z.object({
  templateKey: z.enum(["order_confirmation", "order_status_update"]),
});

export const orderDiscountSchema = z.object({
  discountAmount: decimalValueSchema,
});

export const orderPaymentStatusSchema = z.object({
  paymentStatus: z.nativeEnum(PaymentStatus),
});

export const orderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const orderItemsUpdateSchema = z.object({
  items: z.array(orderItemSchema).min(1),
});

export const orderAddressUpdateSchema = z.object({
  address: orderAddressSchema,
});

export const orderTrackingUpdateSchema = z.object({
  trackingNumber: z.string().trim().min(1).or(z.literal("")).optional(),
  trackingUrl: optionalUrlSchema,
}).refine((value) => Object.keys(value).length > 0, {
  message: "Se requiere trackingNumber o trackingUrl.",
});

export const bulkOrderStatusSchema = z.object({
  orderIds: z.array(z.string().min(1)).min(1),
  status: z.nativeEnum(OrderStatus),
});

export const adminOrderMutationSchema = z.union([
  orderStatusSchema,
  orderPaymentStatusSchema,
  orderTrackingUpdateSchema,
  orderAddressUpdateSchema,
  orderItemsUpdateSchema,
  orderDiscountSchema,
]);

export const orderListFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
  search: z.string().trim().optional(),
  status: z.union([z.nativeEnum(OrderStatus), z.array(z.nativeEnum(OrderStatus))]).optional(),
  paymentStatus: z
    .union([z.nativeEnum(PaymentStatus), z.array(z.nativeEnum(PaymentStatus))])
    .optional(),
  shippingMethodName: z.string().trim().optional(),
  paymentMethodName: z.string().trim().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  totalMin: decimalValueSchema.optional(),
  totalMax: decimalValueSchema.optional(),
  orderIds: z.array(z.string().min(1)).optional(),
});

export const createOrderSchema = z
  .object({
    clerkUserId: z.string().optional(),
    guestEmail: z.email().optional(),
    guestPhone: z.string().optional(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    address: z.string().min(1),
    apartment: z.string().optional(),
    province: z.string().min(1),
    city: z.string().min(1),
    phone: z.string().min(1),
    idNumber: z.string().optional(),
    shippingMethodId: z.string().optional(),
    shippingMethodName: z.string().min(1),
    paymentMethodId: z.string().optional(),
    paymentMethodName: z.string().min(1),
    status: z.nativeEnum(OrderStatus).optional().default(OrderStatus.pending),
    paymentStatus: z.nativeEnum(PaymentStatus).optional().default(PaymentStatus.pending),
    source: z.nativeEnum(OrderSource).optional().default(OrderSource.web),
    externalOrderId: z.string().optional(),
    couponCode: z.string().optional(),
    items: z.array(orderItemSchema).min(1),
    subtotal: decimalValueSchema,
    shippingCost: decimalValueSchema,
    discountAmount: decimalValueSchema.optional().default(0),
    taxAmount: decimalValueSchema.optional().default(0),
    total: decimalValueSchema,
    notes: z.string().optional(),
    billingFirstName: z.string().optional(),
    billingLastName: z.string().optional(),
    billingAddress: z.string().optional(),
    billingApartment: z.string().optional(),
    billingProvince: z.string().optional(),
    billingCity: z.string().optional(),
    billingPhone: z.string().optional(),
    billingRuc: z.string().optional(),
  })
  .refine((data) => data.clerkUserId || data.guestEmail, {
    message: "Either clerkUserId or guestEmail is required",
    path: ["guestEmail"],
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderAddressInput = z.infer<typeof orderAddressSchema>;
export type OrderTrackingInput = z.infer<typeof orderTrackingSchema>;
export type OrderListFiltersInput = z.infer<typeof orderListFiltersSchema>;
