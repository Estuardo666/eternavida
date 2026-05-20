import "server-only";

import { Prisma, WebhookEventStatus } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

function truncateResponseBody(value: string | null | undefined, maxLength = 5000): string | null {
  if (!value) return null;
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export interface WebhookEventListParams {
  page?: number;
  pageSize?: number;
  status?: WebhookEventStatus | WebhookEventStatus[];
  orderId?: string;
  eventType?: string;
  orderNumber?: string;
}

export const webhookEventRepository = {
  async createEvent(orderId: string, eventType: string, payload: Prisma.InputJsonValue) {
    return prisma.webhookEvent.create({
      data: {
        orderId,
        eventType,
        payload,
      },
    });
  },

  async getEventById(id: string) {
    return prisma.webhookEvent.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: true,
            notes: true,
            timeline: true,
          },
        },
      },
    });
  },

  async listPendingEvents(limit = 50) {
    return prisma.webhookEvent.findMany({
      where: {
        status: {
          in: [WebhookEventStatus.pending, WebhookEventStatus.retrying],
        },
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  },

  async listRetryableEvents(limit = 50) {
    return prisma.webhookEvent.findMany({
      where: {
        status: {
          in: [WebhookEventStatus.failed, WebhookEventStatus.retrying, WebhookEventStatus.pending],
        },
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  },

  async listEvents(params: WebhookEventListParams = {}) {
    const { page = 1, pageSize = 20 } = params;
    const statuses = params.status ? (Array.isArray(params.status) ? params.status : [params.status]) : undefined;
    const where: Prisma.WebhookEventWhereInput = {
      ...(statuses ? { status: { in: statuses } } : {}),
      ...(params.orderId ? { orderId: params.orderId } : {}),
      ...(params.eventType ? { eventType: { contains: params.eventType, mode: "insensitive" } } : {}),
      ...(params.orderNumber
        ? {
            order: {
              orderNumber: { contains: params.orderNumber, mode: "insensitive" },
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.webhookEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
        },
      }),
      prisma.webhookEvent.count({ where }),
    ]);

    return { items, total, page, pageSize };
  },

  async incrementAttempt(id: string) {
    return prisma.webhookEvent.update({
      where: { id },
      data: {
        attemptCount: { increment: 1 },
        lastAttemptAt: new Date(),
        status: WebhookEventStatus.retrying,
      },
    });
  },

  async markDelivered(id: string, responseStatus: number, responseBody?: string | null) {
    return prisma.webhookEvent.update({
      where: { id },
      data: {
        status: WebhookEventStatus.delivered,
        lastResponseStatus: responseStatus,
        lastResponseBody: truncateResponseBody(responseBody),
        lastError: null,
      },
    });
  },

  async markFailed(
    id: string,
    error: string,
    responseStatus?: number,
    responseBody?: string | null,
    status: WebhookEventStatus = WebhookEventStatus.failed,
  ) {
    return prisma.webhookEvent.update({
      where: { id },
      data: {
        status,
        lastError: error,
        lastResponseStatus: responseStatus ?? null,
        lastResponseBody: truncateResponseBody(responseBody),
      },
    });
  },
};
