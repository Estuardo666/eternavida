import "server-only";
import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";
import type { AbandonedCartStatus, CartDataItem } from "@/types/abandoned-cart";

export const abandonedCartRepository = {
  async trackActivity(input: {
    clerkUserId?: string | null;
    guestEmail?: string | null;
    guestPhone?: string | null;
    cartData: CartDataItem[];
  }) {
    try {
      const identifier = input.clerkUserId
        ? { clerkUserId: input.clerkUserId }
        : input.guestEmail
          ? { guestEmail: input.guestEmail }
          : null;

      if (!identifier) return null;

      const existing = await prisma.abandonedCart.findFirst({
        where: {
          ...identifier,
          status: "active",
        },
      });

      if (input.cartData.length === 0) {
        if (existing) {
          await prisma.abandonedCart.update({
            where: { id: existing.id },
            data: { status: "expired" },
          });
        }
        return null;
      }

      const cartDataJson = input.cartData as unknown as Prisma.InputJsonValue;

      if (existing) {
        const updateData: Record<string, unknown> = {
          cartData: cartDataJson,
          lastActivityAt: new Date(),
        };
        if (input.guestEmail !== undefined) updateData.guestEmail = input.guestEmail;
        if (input.guestPhone !== undefined) updateData.guestPhone = input.guestPhone;

        return await prisma.abandonedCart.update({
          where: { id: existing.id },
          data: updateData as Prisma.AbandonedCartUpdateInput,
        });
      }

      const createData: Record<string, unknown> = {
        ...identifier,
        guestEmail: input.guestEmail ?? null,
        guestPhone: input.guestPhone ?? null,
        cartData: cartDataJson,
        lastActivityAt: new Date(),
        status: "active",
      };

      return await prisma.abandonedCart.create({
        data: createData as Prisma.AbandonedCartCreateInput,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to track abandoned cart: ${error.message}`);
      }
      throw new Error("Failed to track abandoned cart: Unknown error");
    }
  },

  async markRecovered(clerkUserId?: string | null, guestEmail?: string | null) {
    try {
      const identifier = clerkUserId
        ? { clerkUserId }
        : guestEmail
          ? { guestEmail }
          : null;

      if (!identifier) return;

      await prisma.abandonedCart.updateMany({
        where: { ...identifier, status: "active" },
        data: { status: "recovered", recoveredAt: new Date() },
      });
    } catch (error) {
      console.error("Failed to mark abandoned cart as recovered:", error);
    }
  },

  async findEligibleForRecovery(step: number, delayHours: number) {
    try {
      const cutoff = new Date(Date.now() - delayHours * 60 * 60 * 1000);

      return await prisma.abandonedCart.findMany({
        where: {
          status: "active",
          recoveryStep: step,
          lastActivityAt: { lt: cutoff },
        },
        orderBy: { lastActivityAt: "asc" },
        take: 100,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find eligible carts: ${error.message}`);
      }
      throw new Error("Failed to find eligible carts: Unknown error");
    }
  },

  async incrementRecoveryStep(id: string) {
    try {
      return await prisma.abandonedCart.update({
        where: { id },
        data: { recoveryStep: { increment: 1 } },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to increment recovery step: ${error.message}`);
      }
      throw new Error("Failed to increment recovery step: Unknown error");
    }
  },

  async createRecoveryLog(abandonedCartId: string, step: number) {
    try {
      return await prisma.abandonedCartRecoveryLog.create({
        data: {
          abandonedCartId,
          step,
          emailSentAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create recovery log: ${error.message}`);
      }
      throw new Error("Failed to create recovery log: Unknown error");
    }
  },

  async listAll(filters: {
    status?: AbandonedCartStatus | undefined;
    skip: number;
    take: number;
  }) {
    try {
      return await prisma.abandonedCart.findMany({
        where: {
          ...(filters.status !== undefined && { status: filters.status }),
        },
        orderBy: { lastActivityAt: "desc" },
        skip: filters.skip,
        take: filters.take,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to list abandoned carts: ${error.message}`);
      }
      throw new Error("Failed to list abandoned carts: Unknown error");
    }
  },

  async countAll(status?: AbandonedCartStatus | undefined) {
    try {
      return await prisma.abandonedCart.count({
        where: {
          ...(status !== undefined && { status }),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to count abandoned carts: ${error.message}`);
      }
      throw new Error("Failed to count abandoned carts: Unknown error");
    }
  },

  async getStats() {
    try {
      const [active, recovered, expired, totalRecovered] = await Promise.all([
        prisma.abandonedCart.count({ where: { status: "active" } }),
        prisma.abandonedCart.count({ where: { status: "recovered" } }),
        prisma.abandonedCart.count({ where: { status: "expired" } }),
        prisma.abandonedCartRecoveryLog.count({ where: { convertedAt: { not: null } } }),
      ]);
      return { active, recovered, expired, totalRecovered };
    } catch {
      return { active: 0, recovered: 0, expired: 0, totalRecovered: 0 };
    }
  },
};

export const abandonedCartSettingsRepository = {
  async getSettings() {
    try {
      const settings = await prisma.abandonedCartSettings.findUnique({
        where: { id: "default" },
      });

      if (!settings) {
        return await prisma.abandonedCartSettings.create({
          data: {
            id: "default",
            isEnabled: true,
            steps: [
              { delayHours: 2, subject: "¿Olvidaste algo en tu carrito?", template: "reminder1" },
              { delayHours: 24, subject: "Tu carrito te espera", template: "reminder2" },
              { delayHours: 72, subject: "Última oportunidad", template: "reminder3" },
            ],
            maxRecoverySteps: 3,
            includeDiscount: false,
          },
        });
      }

      return settings;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get abandoned cart settings: ${error.message}`);
      }
      throw new Error("Failed to get abandoned cart settings: Unknown error");
    }
  },

  async updateSettings(data: {
    isEnabled?: boolean;
    steps?: unknown;
    maxRecoverySteps?: number;
    includeDiscount?: boolean;
    discountPercent?: number | null;
    couponPrefix?: string | null;
  }) {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;
      if (data.steps !== undefined) updateData.steps = data.steps;
      if (data.maxRecoverySteps !== undefined) updateData.maxRecoverySteps = data.maxRecoverySteps;
      if (data.includeDiscount !== undefined) updateData.includeDiscount = data.includeDiscount;
      if (data.discountPercent !== undefined) updateData.discountPercent = data.discountPercent;
      if (data.couponPrefix !== undefined) updateData.couponPrefix = data.couponPrefix;

      return await prisma.abandonedCartSettings.update({
        where: { id: "default" },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update abandoned cart settings: ${error.message}`);
      }
      throw new Error("Failed to update abandoned cart settings: Unknown error");
    }
  },
};
