import "server-only";
import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

export const referralRepository = {
  async getProgram() {
    try {
      const program = await prisma.referralProgram.findUnique({
        where: { id: "default" },
      });

      if (!program) {
        return await prisma.referralProgram.create({
          data: {
            id: "default",
            referrerRewardValue: 10,
            referredRewardValue: 10,
          },
        });
      }

      return program;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get referral program: ${error.message}`);
      }
      throw new Error("Failed to get referral program: Unknown error");
    }
  },

  async updateProgram(data: {
    isEnabled?: boolean;
    referrerRewardType?: string;
    referrerRewardValue?: number;
    referredRewardType?: string;
    referredRewardValue?: number;
    couponDurationDays?: number | null;
    maxReferralsPerUser?: number | null;
  }) {
    try {
      return await prisma.referralProgram.update({
        where: { id: "default" },
        data: data as Prisma.ReferralProgramUpdateInput,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update referral program: ${error.message}`);
      }
      throw new Error("Failed to update referral program: Unknown error");
    }
  },

  async generateCode(clerkUserId: string): Promise<string> {
    try {
      const existing = await prisma.referralCode.findUnique({
        where: { clerkUserId },
      });

      if (existing) {
        return existing.code;
      }

      const code = `DERM-${nanoid(6).toUpperCase()}`;

      await prisma.referralCode.create({
        data: {
          clerkUserId,
          code,
        },
      });

      return code;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate referral code: ${error.message}`);
      }
      throw new Error("Failed to generate referral code: Unknown error");
    }
  },

  async getCodeByUser(clerkUserId: string) {
    try {
      return await prisma.referralCode.findUnique({
        where: { clerkUserId },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get referral code: ${error.message}`);
      }
      throw new Error("Failed to get referral code: Unknown error");
    }
  },

  async getCodeByCode(code: string) {
    try {
      return await prisma.referralCode.findUnique({
        where: { code },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get referral code: ${error.message}`);
      }
      throw new Error("Failed to get referral code: Unknown error");
    }
  },

  async createReferral(referralCodeId: string, referredEmail: string, referredUserId?: string) {
    try {
      return await prisma.referral.create({
        data: {
          referralCodeId,
          referredEmail,
          referredUserId: referredUserId ?? null,
          status: referredUserId ? "registered" : "pending",
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create referral: ${error.message}`);
      }
      throw new Error("Failed to create referral: Unknown error");
    }
  },

  async findPendingReferralByEmail(email: string) {
    try {
      return await prisma.referral.findFirst({
        where: {
          referredEmail: email,
          status: { in: ["pending", "registered"] },
        },
        include: { referralCode: true },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find referral: ${error.message}`);
      }
      throw new Error("Failed to find referral: Unknown error");
    }
  },

  async updateReferral(id: string, data: {
    status?: string;
    referredUserId?: string;
    referrerCoupon?: string;
    referredCoupon?: string;
    rewardedAt?: Date;
  }) {
    try {
      return await prisma.referral.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update referral: ${error.message}`);
      }
      throw new Error("Failed to update referral: Unknown error");
    }
  },

  async incrementCodeUses(codeId: string) {
    try {
      return await prisma.referralCode.update({
        where: { id: codeId },
        data: { usesCount: { increment: 1 } },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to increment code uses: ${error.message}`);
      }
      throw new Error("Failed to increment code uses: Unknown error");
    }
  },

  async listAll(filters: { skip: number; take: number }) {
    try {
      return await prisma.referral.findMany({
        include: {
          referralCode: { select: { code: true, clerkUserId: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: filters.skip,
        take: filters.take,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to list referrals: ${error.message}`);
      }
      throw new Error("Failed to list referrals: Unknown error");
    }
  },

  async countAll() {
    try {
      return await prisma.referral.count();
    } catch {
      return 0;
    }
  },

  async getStats() {
    try {
      const [total, pending, registered, purchased, rewarded] = await Promise.all([
        prisma.referral.count(),
        prisma.referral.count({ where: { status: "pending" } }),
        prisma.referral.count({ where: { status: "registered" } }),
        prisma.referral.count({ where: { status: "purchased" } }),
        prisma.referral.count({ where: { status: "rewarded" } }),
      ]);
      return { total, pending, registered, purchased, rewarded };
    } catch {
      return { total: 0, pending: 0, registered: 0, purchased: 0, rewarded: 0 };
    }
  },
};
