import "server-only";
import { prisma } from "@/server/db/prisma";

export const wishlistRepository = {
  async toggle(clerkUserId: string, productId: string): Promise<{ added: boolean }> {
    try {
      const existing = await prisma.wishlistItem.findUnique({
        where: { clerkUserId_productId: { clerkUserId, productId } },
      });

      if (existing) {
        await prisma.wishlistItem.delete({ where: { id: existing.id } });
        return { added: false };
      }

      await prisma.wishlistItem.create({
        data: { clerkUserId, productId },
      });
      return { added: true };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to toggle wishlist: ${error.message}`);
      }
      throw new Error("Failed to toggle wishlist: Unknown error");
    }
  },

  async listByUser(clerkUserId: string) {
    try {
      return await prisma.wishlistItem.findMany({
        where: { clerkUserId },
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              brand: true,
              price: true,
              discountPrice: true,
              stock: true,
              href: true,
              mediaAssetId: true,
              isActive: true,
              mediaAsset: {
                select: {
                  publicUrl: true,
                  altText: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to list wishlist: ${error.message}`);
      }
      throw new Error("Failed to list wishlist: Unknown error");
    }
  },

  async isFavorited(clerkUserId: string, productId: string): Promise<boolean> {
    try {
      const item = await prisma.wishlistItem.findUnique({
        where: { clerkUserId_productId: { clerkUserId, productId } },
        select: { id: true },
      });
      return !!item;
    } catch {
      return false;
    }
  },

  async getFavoritedProductIds(clerkUserId: string, productIds: string[]): Promise<string[]> {
    try {
      const items = await prisma.wishlistItem.findMany({
        where: {
          clerkUserId,
          productId: { in: productIds },
        },
        select: { productId: true },
      });
      return items.map((i) => i.productId);
    } catch {
      return [];
    }
  },

  async delete(clerkUserId: string, productId: string): Promise<void> {
    try {
      await prisma.wishlistItem.delete({
        where: { clerkUserId_productId: { clerkUserId, productId } },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete wishlist item: ${error.message}`);
      }
      throw new Error("Failed to delete wishlist item: Unknown error");
    }
  },

  async countByUser(clerkUserId: string): Promise<number> {
    try {
      return await prisma.wishlistItem.count({
        where: { clerkUserId },
      });
    } catch {
      return 0;
    }
  },
};
