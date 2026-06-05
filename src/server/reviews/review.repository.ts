import "server-only";
import { prisma } from "@/server/db/prisma";
import type { ReviewStatus } from "@prisma/client";

export const reviewRepository = {
  async create(input: {
    productId: string;
    clerkUserId: string;
    rating: number;
    title?: string | null | undefined;
    body?: string | null | undefined;
    isVerifiedPurchase: boolean;
  }) {
    try {
      return await prisma.review.create({
        data: {
          productId: input.productId,
          clerkUserId: input.clerkUserId,
          rating: input.rating,
          title: input.title ?? null,
          body: input.body ?? null,
          isVerifiedPurchase: input.isVerifiedPurchase,
          status: "pending",
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create review: ${error.message}`);
      }
      throw new Error("Failed to create review: Unknown error");
    }
  },

  async findById(id: string) {
    try {
      return await prisma.review.findUnique({ where: { id } });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find review: ${error.message}`);
      }
      throw new Error("Failed to find review: Unknown error");
    }
  },

  async findByProductAndUser(productId: string, clerkUserId: string) {
    try {
      return await prisma.review.findUnique({
        where: { productId_clerkUserId: { productId, clerkUserId } },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find review: ${error.message}`);
      }
      throw new Error("Failed to find review: Unknown error");
    }
  },

  async listByProduct(
    productId: string,
    options: { status?: ReviewStatus; skip: number; take: number },
  ) {
    try {
      return await prisma.review.findMany({
        where: {
          productId,
          ...(options.status !== undefined && { status: options.status }),
        },
        orderBy: { createdAt: "desc" },
        skip: options.skip,
        take: options.take,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to list reviews: ${error.message}`);
      }
      throw new Error("Failed to list reviews: Unknown error");
    }
  },

  async countByProduct(productId: string, status?: ReviewStatus) {
    try {
      return await prisma.review.count({
        where: {
          productId,
          ...(status !== undefined && { status }),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to count reviews: ${error.message}`);
      }
      throw new Error("Failed to count reviews: Unknown error");
    }
  },

  async listAll(filters: {
    status?: ReviewStatus | undefined;
    skip: number;
    take: number;
  }) {
    try {
      return await prisma.review.findMany({
        where: {
          ...(filters.status !== undefined && { status: filters.status }),
        },
        include: {
          product: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: filters.skip,
        take: filters.take,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to list reviews: ${error.message}`);
      }
      throw new Error("Failed to list reviews: Unknown error");
    }
  },

  async countAll(status?: ReviewStatus | undefined) {
    try {
      return await prisma.review.count({
        where: {
          ...(status !== undefined && { status }),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to count reviews: ${error.message}`);
      }
      throw new Error("Failed to count reviews: Unknown error");
    }
  },

  async update(
    id: string,
    data: {
      rating?: number | undefined;
      title?: string | null | undefined;
      body?: string | null | undefined;
      status?: ReviewStatus | undefined;
      adminResponse?: string | null | undefined;
      adminRespondedAt?: Date | null | undefined;
    },
  ) {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.rating !== undefined) updateData.rating = data.rating;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.body !== undefined) updateData.body = data.body;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.adminResponse !== undefined) updateData.adminResponse = data.adminResponse;
      if (data.adminRespondedAt !== undefined) updateData.adminRespondedAt = data.adminRespondedAt;

      return await prisma.review.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update review: ${error.message}`);
      }
      throw new Error("Failed to update review: Unknown error");
    }
  },

  async delete(id: string) {
    try {
      return await prisma.review.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete review: ${error.message}`);
      }
      throw new Error("Failed to delete review: Unknown error");
    }
  },

  async getAggregate(productId: string) {
    try {
      const approved = await prisma.review.findMany({
        where: { productId, status: "approved" },
        select: { rating: true, isVerifiedPurchase: true },
      });

      const totalReviews = approved.length;
      if (totalReviews === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          verifiedCount: 0,
        };
      }

      const sum = approved.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = Math.round((sum / totalReviews) * 10) / 10;
      const verifiedCount = approved.filter((r) => r.isVerifiedPurchase).length;

      const ratingDistribution: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      for (const r of approved) {
        ratingDistribution[r.rating] = (ratingDistribution[r.rating] ?? 0) + 1;
      }

      return { averageRating, totalReviews, ratingDistribution, verifiedCount };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get review aggregate: ${error.message}`);
      }
      throw new Error("Failed to get review aggregate: Unknown error");
    }
  },

  async hasVerifiedPurchase(clerkUserId: string, productId: string): Promise<boolean> {
    try {
      const count = await prisma.orderItem.count({
        where: {
          productId,
          order: {
            clerkUserId,
            status: { in: ["confirmed", "processing", "shipped", "delivered"] },
          },
        },
      });
      return count > 0;
    } catch {
      return false;
    }
  },
};
