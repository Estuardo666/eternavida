import "server-only";
import { prisma } from "@/server/db/prisma";

export const restockAlertRepository = {
  async subscribe(email: string, productId: string) {
    try {
      const existing = await prisma.restockAlert.findUnique({
        where: { email_productId: { email, productId } },
      });

      if (existing) {
        return { alreadySubscribed: true };
      }

      await prisma.restockAlert.create({
        data: { email, productId },
      });

      return { alreadySubscribed: false };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to subscribe to restock alert: ${error.message}`);
      }
      throw new Error("Failed to subscribe to restock alert: Unknown error");
    }
  },

  async unsubscribe(email: string, productId: string) {
    try {
      await prisma.restockAlert.delete({
        where: { email_productId: { email, productId } },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to unsubscribe from restock alert: ${error.message}`);
      }
      throw new Error("Failed to unsubscribe from restock alert: Unknown error");
    }
  },

  async findPendingByProduct(productId: string) {
    try {
      return await prisma.restockAlert.findMany({
        where: {
          productId,
          notifiedAt: null,
        },
        orderBy: { createdAt: "asc" },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find restock alerts: ${error.message}`);
      }
      throw new Error("Failed to find restock alerts: Unknown error");
    }
  },

  async markNotified(ids: string[]) {
    try {
      await prisma.restockAlert.updateMany({
        where: { id: { in: ids } },
        data: { notifiedAt: new Date() },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to mark alerts as notified: ${error.message}`);
      }
      throw new Error("Failed to mark alerts as notified: Unknown error");
    }
  },

  async isSubscribed(email: string, productId: string): Promise<boolean> {
    try {
      const alert = await prisma.restockAlert.findUnique({
        where: { email_productId: { email, productId } },
        select: { id: true },
      });
      return !!alert;
    } catch {
      return false;
    }
  },

  async countByProduct(productId: string): Promise<number> {
    try {
      return await prisma.restockAlert.count({
        where: { productId, notifiedAt: null },
      });
    } catch {
      return 0;
    }
  },

  async listAll(filters: { skip: number; take: number }) {
    try {
      return await prisma.restockAlert.findMany({
        include: {
          product: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: filters.skip,
        take: filters.take,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to list restock alerts: ${error.message}`);
      }
      throw new Error("Failed to list restock alerts: Unknown error");
    }
  },

  async countAll() {
    try {
      return await prisma.restockAlert.count();
    } catch {
      return 0;
    }
  },
};

export const restockAlertSettingsRepository = {
  async getSettings() {
    try {
      const settings = await prisma.restockAlertSettings.findUnique({
        where: { id: "default" },
      });

      if (!settings) {
        return await prisma.restockAlertSettings.create({
          data: { id: "default" },
        });
      }

      return settings;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get restock alert settings: ${error.message}`);
      }
      throw new Error("Failed to get restock alert settings: Unknown error");
    }
  },

  async updateSettings(data: {
    isEnabled?: boolean;
    emailSubject?: string;
    maxAlertsPerProduct?: number;
    expiresAfterDays?: number;
  }) {
    try {
      return await prisma.restockAlertSettings.update({
        where: { id: "default" },
        data,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update restock alert settings: ${error.message}`);
      }
      throw new Error("Failed to update restock alert settings: Unknown error");
    }
  },
};
