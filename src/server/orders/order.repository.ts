import "server-only";
import { prisma } from "@/server/db/prisma";
import {
  OrderNoteVisibility,
  PaymentStatus,
  Prisma,
  OrderStatus,
} from "@prisma/client";
import type {
  CreateOrderInput,
  OrderAddressInput,
  OrderItemInput,
} from "./order.schemas";

const orderListInclude = Prisma.validator<Prisma.OrderInclude>()({
  items: true,
});

const orderDetailInclude = Prisma.validator<Prisma.OrderInclude>()({
  items: true,
  notes: {
    orderBy: { createdAt: "desc" },
  },
  timeline: {
    orderBy: { createdAt: "desc" },
  },
  webhookEvents: {
    orderBy: { createdAt: "desc" },
    take: 50,
  },
});

export type OrderListRecord = Prisma.OrderGetPayload<{
  include: typeof orderListInclude;
}>;

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof orderDetailInclude;
}>;

export interface OrderQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  shippingMethodName?: string;
  paymentMethodName?: string;
  dateFrom?: string;
  dateTo?: string;
  totalMin?: string | number;
  totalMax?: string | number;
  orderIds?: string[];
}

interface DecimalLike {
  toNumber(): number;
  toString(): string;
}

function toDecimal(val: string | number): Prisma.Decimal {
  return new Prisma.Decimal(String(val));
}

function toNumberValue(value: DecimalLike | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return value.toNumber();
}

function toNullableText(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toOptionalStatusArray<T extends string>(value?: T | T[]): T[] | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value];
}

function parseDateBoundary(value: string | undefined, boundary: "start" | "end"): Date | undefined {
  if (!value) return undefined;
  const timestamp = boundary === "start" ? `${value}T00:00:00.000Z` : `${value}T23:59:59.999Z`;
  const parsed = new Date(timestamp);

  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

function buildCreatedAtFilter(dateFrom?: string, dateTo?: string): Prisma.DateTimeFilter | undefined {
  const gte = parseDateBoundary(dateFrom, "start");
  const lte = parseDateBoundary(dateTo, "end");

  if (!gte && !lte) return undefined;

  return {
    ...(gte ? { gte } : {}),
    ...(lte ? { lte } : {}),
  };
}

function buildTotalFilter(totalMin?: string | number, totalMax?: string | number): Prisma.DecimalFilter | undefined {
  if (totalMin == null && totalMax == null) return undefined;

  return {
    ...(totalMin != null ? { gte: toDecimal(totalMin) } : {}),
    ...(totalMax != null ? { lte: toDecimal(totalMax) } : {}),
  };
}

function buildOrderWhere(params: OrderQueryParams): Prisma.OrderWhereInput {
  const normalizedSearch = params.search?.trim();
  const status = toOptionalStatusArray(params.status);
  const paymentStatus = toOptionalStatusArray(params.paymentStatus);
  const createdAt = buildCreatedAtFilter(params.dateFrom, params.dateTo);
  const total = buildTotalFilter(params.totalMin, params.totalMax);

  return {
    ...(status ? { status: { in: status } } : {}),
    ...(paymentStatus ? { paymentStatus: { in: paymentStatus } } : {}),
    ...(params.orderIds?.length ? { id: { in: params.orderIds } } : {}),
    ...(params.shippingMethodName
      ? { shippingMethodName: { equals: params.shippingMethodName, mode: "insensitive" } }
      : {}),
    ...(params.paymentMethodName
      ? { paymentMethodName: { equals: params.paymentMethodName, mode: "insensitive" } }
      : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(total ? { total } : {}),
    ...(normalizedSearch
      ? {
          OR: [
            { orderNumber: { contains: normalizedSearch, mode: "insensitive" } },
            { guestEmail: { contains: normalizedSearch, mode: "insensitive" } },
            { guestPhone: { contains: normalizedSearch, mode: "insensitive" } },
            { firstName: { contains: normalizedSearch, mode: "insensitive" } },
            { lastName: { contains: normalizedSearch, mode: "insensitive" } },
            { phone: { contains: normalizedSearch, mode: "insensitive" } },
            { idNumber: { contains: normalizedSearch, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

function getEffectiveUnitPrice(item: OrderItemInput): Prisma.Decimal {
  return item.discountPrice != null ? toDecimal(item.discountPrice) : toDecimal(item.price);
}

function calculateSubtotal(items: OrderItemInput[]): Prisma.Decimal {
  return items.reduce((sum, item) => sum.plus(getEffectiveUnitPrice(item).mul(item.quantity)), new Prisma.Decimal(0));
}

function calculateTotal(params: {
  subtotal: Prisma.Decimal;
  shippingCost: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
}): Prisma.Decimal {
  const total = params.subtotal.plus(params.shippingCost).plus(params.taxAmount).minus(params.discountAmount);
  return total.lessThan(0) ? new Prisma.Decimal(0) : total;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addUtcMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

async function getRangeSummary(start: Date, end: Date) {
  const where = {
    createdAt: {
      gte: start,
      lt: end,
    },
  } satisfies Prisma.OrderWhereInput;

  const [count, aggregate] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.aggregate({
      where,
      _sum: { total: true },
    }),
  ]);

  return {
    count,
    revenue: toNumberValue(aggregate._sum.total),
  };
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `DRM-${timestamp}${random}`;
}

export const orderRepository = {
  async createOrder(input: CreateOrderInput) {
    const orderNumber = generateOrderNumber();

    return prisma.order.create({
      data: {
        orderNumber,
        clerkUserId: input.clerkUserId ?? null,
        guestEmail: input.guestEmail ?? null,
        guestPhone: input.guestPhone ?? null,
        status: input.status,
        paymentStatus: input.paymentStatus,
        source: input.source,
        externalOrderId: input.externalOrderId ?? null,
        firstName: input.firstName,
        lastName: input.lastName,
        address: input.address,
        apartment: input.apartment ?? null,
        province: input.province,
        city: input.city,
        phone: input.phone,
        idNumber: input.idNumber ?? null,
        shippingMethodId: input.shippingMethodId ?? null,
        shippingMethodName: input.shippingMethodName,
        paymentMethodId: input.paymentMethodId ?? null,
        paymentMethodName: input.paymentMethodName,
        couponCode: input.couponCode ?? null,
        subtotal: toDecimal(input.subtotal),
        shippingCost: toDecimal(input.shippingCost),
        discountAmount: toDecimal(input.discountAmount ?? 0),
        taxAmount: toDecimal(input.taxAmount ?? 0),
        total: toDecimal(input.total),
        checkoutNotes: input.notes ?? null,
        billingFirstName: input.billingFirstName ?? null,
        billingLastName: input.billingLastName ?? null,
        billingAddress: input.billingAddress ?? null,
        billingApartment: input.billingApartment ?? null,
        billingProvince: input.billingProvince ?? null,
        billingCity: input.billingCity ?? null,
        billingPhone: input.billingPhone ?? null,
        billingRuc: input.billingRuc ?? null,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId ?? null,
            name: item.name,
            brand: item.brand,
            price: toDecimal(item.price),
            discountPrice: item.discountPrice != null ? toDecimal(item.discountPrice) : null,
            quantity: item.quantity,
            imageUrl: item.imageUrl ?? null,
          })),
        },
        ...(input.notes
          ? {
              notes: {
                create: {
                  content: input.notes,
                  visibility: OrderNoteVisibility.customer,
                  createdBy: "system",
                },
              },
            }
          : {}),
      },
      include: orderDetailInclude,
    });
  },

  async getOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: orderDetailInclude,
    });
  },

  async getOrderByUserIdAndOrderId(orderId: string, userId: string) {
    return prisma.order.findFirst({
      where: {
        id: orderId,
        clerkUserId: userId,
      },
      include: orderDetailInclude,
    });
  },

  async getOrdersByUserId(
    userId: string,
    params: { page?: number; pageSize?: number; archived?: boolean } = {},
  ) {
    const { page = 1, pageSize = 20, archived = false } = params;
    const where = { clerkUserId: userId, archived };
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: orderListInclude,
      }),
      prisma.order.count({ where }),
    ]);
    return { items, total, page, pageSize };
  },

  async getAllOrders(params: OrderQueryParams = {}) {
    const { page = 1, pageSize = 30 } = params;
    const where = buildOrderWhere(params);

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: orderListInclude,
      }),
      prisma.order.count({ where }),
    ]);
    return { items, total, page, pageSize };
  },

  async getOrdersForExport(params: OrderQueryParams = {}) {
    const where = buildOrderWhere(params);

    return prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: orderListInclude,
    });
  },

  async updateOrderStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status },
      include: orderDetailInclude,
    });
  },

  async addOrderNote(
    orderId: string,
    content: string,
    visibility: OrderNoteVisibility,
    createdBy?: string,
  ) {
    return prisma.orderNote.create({
      data: {
        orderId,
        content,
        visibility,
        createdBy: createdBy ?? null,
      },
    });
  },

  async getOrderNotes(orderId: string) {
    return prisma.orderNote.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
  },

  async addOrderTimeline(
    orderId: string,
    eventType: string,
    description: string,
    metadata?: Prisma.InputJsonValue,
    createdBy?: string,
  ) {
    return prisma.orderTimeline.create({
      data: {
        orderId,
        eventType,
        description,
        ...(metadata !== undefined ? { metadata } : {}),
        createdBy: createdBy ?? null,
      },
    });
  },

  async getOrderTimeline(orderId: string) {
    return prisma.orderTimeline.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
  },

  async updateOrderTracking(
    orderId: string,
    input: { trackingNumber?: string | null; trackingUrl?: string | null },
  ) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: toNullableText(input.trackingNumber),
        trackingUrl: toNullableText(input.trackingUrl),
      },
      include: orderDetailInclude,
    });
  },

  async updateOrderPaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    return prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus },
      include: orderDetailInclude,
    });
  },

  async updateOrderArchived(orderId: string, archived: boolean) {
    return prisma.order.update({
      where: { id: orderId },
      data: { archived },
      include: orderDetailInclude,
    });
  },

  async updateOrderAddress(orderId: string, addressFields: OrderAddressInput) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        ...(addressFields.firstName ? { firstName: addressFields.firstName.trim() } : {}),
        ...(addressFields.lastName ? { lastName: addressFields.lastName.trim() } : {}),
        ...(addressFields.address ? { address: addressFields.address.trim() } : {}),
        ...(addressFields.apartment !== undefined ? { apartment: toNullableText(addressFields.apartment) } : {}),
        ...(addressFields.province ? { province: addressFields.province.trim() } : {}),
        ...(addressFields.city ? { city: addressFields.city.trim() } : {}),
        ...(addressFields.phone ? { phone: addressFields.phone.trim() } : {}),
        ...(addressFields.idNumber !== undefined ? { idNumber: toNullableText(addressFields.idNumber) } : {}),
      },
      include: orderDetailInclude,
    });
  },

  async updateOrderItems(orderId: string, items: OrderItemInput[]) {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        shippingCost: true,
        taxAmount: true,
        discountAmount: true,
      },
    });

    if (!existingOrder) {
      throw new Error("ORDER_NOT_FOUND");
    }

    const subtotal = calculateSubtotal(items);
    const total = calculateTotal({
      subtotal,
      shippingCost: existingOrder.shippingCost,
      taxAmount: existingOrder.taxAmount,
      discountAmount: existingOrder.discountAmount,
    });

    return prisma.order.update({
      where: { id: orderId },
      data: {
        subtotal,
        total,
        items: {
          deleteMany: {},
          create: items.map((item) => ({
            productId: item.productId ?? null,
            name: item.name,
            brand: item.brand,
            price: toDecimal(item.price),
            discountPrice: item.discountPrice != null ? toDecimal(item.discountPrice) : null,
            quantity: item.quantity,
            imageUrl: item.imageUrl ?? null,
          })),
        },
      },
      include: orderDetailInclude,
    });
  },

  async applyOrderDiscount(orderId: string, discountAmount: string | number) {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        subtotal: true,
        shippingCost: true,
        taxAmount: true,
      },
    });

    if (!existingOrder) {
      throw new Error("ORDER_NOT_FOUND");
    }

    const parsedDiscountAmount = toDecimal(discountAmount);
    const total = calculateTotal({
      subtotal: existingOrder.subtotal,
      shippingCost: existingOrder.shippingCost,
      taxAmount: existingOrder.taxAmount,
      discountAmount: parsedDiscountAmount,
    });

    return prisma.order.update({
      where: { id: orderId },
      data: {
        discountAmount: parsedDiscountAmount,
        total,
      },
      include: orderDetailInclude,
    });
  },

  async getOrderStats() {
    const now = new Date();
    const todayStart = startOfUtcDay(now);
    const tomorrowStart = addUtcDays(todayStart, 1);
    const yesterdayStart = addUtcDays(todayStart, -1);
    const weekStart = addUtcDays(todayStart, -6);
    const previousWeekStart = addUtcDays(weekStart, -7);
    const monthStart = startOfUtcMonth(now);
    const nextMonthStart = addUtcMonths(monthStart, 1);
    const previousMonthStart = addUtcMonths(monthStart, -1);
    const lastThirtyDaysStart = addUtcDays(todayStart, -29);
    const lastSevenDaysStart = addUtcDays(todayStart, -6);

    const [today, yesterday, week, previousWeek, month, previousMonth, statusRows, recentOrders, paymentRows] =
      await Promise.all([
        getRangeSummary(todayStart, tomorrowStart),
        getRangeSummary(yesterdayStart, todayStart),
        getRangeSummary(weekStart, tomorrowStart),
        getRangeSummary(previousWeekStart, weekStart),
        getRangeSummary(monthStart, nextMonthStart),
        getRangeSummary(previousMonthStart, monthStart),
        prisma.order.groupBy({
          by: ["status"],
          where: {
            createdAt: { gte: lastThirtyDaysStart },
          },
          _count: { _all: true },
        }),
        prisma.order.findMany({
          where: {
            createdAt: { gte: lastSevenDaysStart },
          },
          select: {
            createdAt: true,
            total: true,
          },
          orderBy: { createdAt: "asc" },
        }),
        prisma.order.findMany({
          where: {
            createdAt: { gte: lastThirtyDaysStart },
          },
          select: {
            paymentMethodName: true,
            total: true,
          },
        }),
      ]);

    const statusBreakdown = statusRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {});

    const dailyRevenueMap = new Map<string, number>();
    for (let cursor = new Date(lastSevenDaysStart); cursor < tomorrowStart; cursor = addUtcDays(cursor, 1)) {
      dailyRevenueMap.set(cursor.toISOString().slice(0, 10), 0);
    }

    for (const order of recentOrders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      dailyRevenueMap.set(key, (dailyRevenueMap.get(key) ?? 0) + toNumberValue(order.total));
    }

    const paymentBreakdownMap = new Map<string, { paymentMethodName: string; count: number; revenue: number }>();
    for (const row of paymentRows) {
      const current = paymentBreakdownMap.get(row.paymentMethodName) ?? {
        paymentMethodName: row.paymentMethodName,
        count: 0,
        revenue: 0,
      };

      current.count += 1;
      current.revenue += toNumberValue(row.total);
      paymentBreakdownMap.set(row.paymentMethodName, current);
    }

    return {
      today: { ...today, previous: yesterday },
      week: { ...week, previous: previousWeek },
      month: { ...month, previous: previousMonth },
      statusBreakdown,
      dailyRevenue: Array.from(dailyRevenueMap.entries()).map(([date, revenue]) => ({ date, revenue })),
      paymentMethodBreakdown: Array.from(paymentBreakdownMap.values())
        .sort((left, right) => right.count - left.count)
        .slice(0, 5),
    };
  },
};
