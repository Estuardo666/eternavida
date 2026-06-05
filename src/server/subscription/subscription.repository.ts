import "server-only";
import { prisma } from "@/server/db/prisma";
import type { SubscriptionFrequency, SubscriptionStatus } from "@prisma/client";

export const subscriptionRepository = {
  async create(input: {
    clerkUserId: string;
    productId: string;
    frequency: SubscriptionFrequency;
    quantity: number;
    nextOrderAt: Date;
  }) {
    try {
      return await prisma.subscription.create({
        data: {
          clerkUserId: input.clerkUserId,
          productId: input.productId,
          frequency: input.frequency,
          quantity: input.quantity,
          nextOrderAt: input.nextOrderAt,
          status: "active",
        },
      });
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to create subscription: ${error.message}`);
      throw new Error("Failed to create subscription: Unknown error");
    }
  },

  async findById(id: string) {
    try {
      return await prisma.subscription.findUnique({ where: { id } });
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to find subscription: ${error.message}`);
      throw new Error("Failed to find subscription: Unknown error");
    }
  },

  async listByUser(clerkUserId: string) {
    try {
      return await prisma.subscription.findMany({
        where: { clerkUserId },
        include: {
          product: { select: { name: true, slug: true, brand: true, price: true, discountPrice: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to list subscriptions: ${error.message}`);
      throw new Error("Failed to list subscriptions: Unknown error");
    }
  },

  async updateStatus(id: string, status: SubscriptionStatus) {
    try {
      return await prisma.subscription.update({ where: { id }, data: { status } });
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to update subscription: ${error.message}`);
      throw new Error("Failed to update subscription: Unknown error");
    }
  },

  async updateNextOrder(id: string, nextOrderAt: Date, lastOrderId?: string) {
    try {
      return await prisma.subscription.update({
        where: { id },
        data: {
          nextOrderAt,
          lastOrderAt: new Date(),
          lastOrderId: lastOrderId ?? null,
          totalCycles: { increment: 1 },
        },
      });
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to update subscription: ${error.message}`);
      throw new Error("Failed to update subscription: Unknown error");
    }
  },

  async findDueForReminder(reminderDaysBefore: number) {
    try {
      const reminderDate = new Date(Date.now() + reminderDaysBefore * 24 * 60 * 60 * 1000);
      return await prisma.subscription.findMany({
        where: {
          status: "active",
          nextOrderAt: { lte: reminderDate },
        },
        include: {
          product: { select: { name: true, slug: true, price: true, discountPrice: true } },
        },
      });
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to find due subscriptions: ${error.message}`);
      throw new Error("Failed to find due subscriptions: Unknown error");
    }
  },

  async listAll(filters: { status?: SubscriptionStatus | undefined; skip: number; take: number }) {
    try {
      return await prisma.subscription.findMany({
        where: { ...(filters.status !== undefined && { status: filters.status }) },
        include: {
          product: { select: { name: true, slug: true, brand: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: filters.skip,
        take: filters.take,
      });
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to list subscriptions: ${error.message}`);
      throw new Error("Failed to list subscriptions: Unknown error");
    }
  },

  async countAll(status?: SubscriptionStatus | undefined) {
    try {
      return await prisma.subscription.count({
        where: { ...(status !== undefined && { status }) },
      });
    } catch {
      return 0;
    }
  },

  async getStats() {
    try {
      const [active, paused, cancelled] = await Promise.all([
        prisma.subscription.count({ where: { status: "active" } }),
        prisma.subscription.count({ where: { status: "paused" } }),
        prisma.subscription.count({ where: { status: "cancelled" } }),
      ]);
      return { active, paused, cancelled, total: active + paused + cancelled };
    } catch {
      return { active: 0, paused: 0, cancelled: 0, total: 0 };
    }
  },
};

export const subscriptionSettingsRepository = {
  async getSettings() {
    try {
      const settings = await prisma.subscriptionSettings.findUnique({ where: { id: "default" } });
      if (!settings) {
        return await prisma.subscriptionSettings.create({ data: { id: "default" } });
      }
      return settings;
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to get settings: ${error.message}`);
      throw new Error("Failed to get settings: Unknown error");
    }
  },

  async updateSettings(data: Record<string, unknown>) {
    try {
      return await prisma.subscriptionSettings.update({ where: { id: "default" }, data });
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to update settings: ${error.message}`);
      throw new Error("Failed to update settings: Unknown error");
    }
  },
};
