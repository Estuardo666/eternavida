import "server-only";
import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";

export const collectionRepository = {
  async findAll(options?: { isActive?: boolean; includeInactive?: boolean }) {
    try {
      const where: Prisma.CollectionWhereInput = {};
      if (!options?.includeInactive) {
        where.isActive = options?.isActive ?? true;
      }

      return await prisma.collection.findMany({
        where,
        include: {
          mediaAsset: { select: { id: true, publicUrl: true, altText: true } },
          _count: { select: { products: true, categories: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to list collections: ${error.message}`);
      throw new Error("Failed to list collections: Unknown error");
    }
  },

  async findBySlug(slug: string) {
    try {
      return await prisma.collection.findUnique({
        where: { slug },
        include: {
          mediaAsset: { select: { id: true, publicUrl: true, altText: true } },
          products: {
            include: {
              product: {
                select: {
                  id: true, slug: true, name: true, brand: true,
                  price: true, discountPrice: true, stock: true,
                  href: true, mediaAssetId: true, isActive: true,
                },
              },
            },
            orderBy: { position: "asc" },
          },
          categories: {
            include: {
              category: { select: { id: true, slug: true, name: true, href: true } },
            },
            orderBy: { position: "asc" },
          },
        },
      });
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to find collection: ${error.message}`);
      throw new Error("Failed to find collection: Unknown error");
    }
  },

  async findById(id: string) {
    try {
      return await prisma.collection.findUnique({
        where: { id },
        include: {
          mediaAsset: { select: { id: true, publicUrl: true, altText: true } },
          products: {
            include: {
              product: {
                select: {
                  id: true, slug: true, name: true, brand: true,
                  price: true, discountPrice: true, stock: true,
                  href: true, mediaAssetId: true,
                },
              },
            },
            orderBy: { position: "asc" },
          },
          categories: {
            include: {
              category: { select: { id: true, slug: true, name: true, href: true } },
            },
            orderBy: { position: "asc" },
          },
        },
      });
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to find collection: ${error.message}`);
      throw new Error("Failed to find collection: Unknown error");
    }
  },

  async create(input: {
    slug: string;
    name: string;
    description?: string | null;
    excerpt?: string | null;
    isActive?: boolean;
    sortOrder?: number;
    mediaAssetId?: string | null;
    productIds?: string[];
    categoryIds?: string[];
  }) {
    try {
      return await prisma.collection.create({
        data: {
          slug: input.slug,
          name: input.name,
          description: input.description ?? null,
          excerpt: input.excerpt ?? null,
          isActive: input.isActive ?? true,
          sortOrder: input.sortOrder ?? 0,
          mediaAssetId: input.mediaAssetId ?? null,
          ...(input.productIds && input.productIds.length > 0 && {
            products: {
              create: input.productIds.map((productId, index) => ({
                productId,
                position: index,
              })),
            },
          }),
          ...(input.categoryIds && input.categoryIds.length > 0 && {
            categories: {
              create: input.categoryIds.map((categoryId, index) => ({
                categoryId,
                position: index,
              })),
            },
          }),
        },
      });
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to create collection: ${error.message}`);
      throw new Error("Failed to create collection: Unknown error");
    }
  },

  async update(id: string, input: {
    slug?: string;
    name?: string;
    description?: string | null;
    excerpt?: string | null;
    isActive?: boolean;
    sortOrder?: number;
    mediaAssetId?: string | null;
    productIds?: string[];
    categoryIds?: string[];
  }) {
    try {
      const updateData: Prisma.CollectionUpdateInput = {};

      if (input.slug !== undefined) updateData.slug = input.slug;
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.excerpt !== undefined) updateData.excerpt = input.excerpt;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
      if (input.mediaAssetId !== undefined) {
        updateData.mediaAsset = input.mediaAssetId
          ? { connect: { id: input.mediaAssetId } }
          : { disconnect: true };
      }

      if (input.productIds !== undefined) {
        updateData.products = {
          deleteMany: {},
          create: input.productIds.map((productId, index) => ({
            productId,
            position: index,
          })),
        };
      }

      if (input.categoryIds !== undefined) {
        updateData.categories = {
          deleteMany: {},
          create: input.categoryIds.map((categoryId, index) => ({
            categoryId,
            position: index,
          })),
        };
      }

      return await prisma.collection.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to update collection: ${error.message}`);
      throw new Error("Failed to update collection: Unknown error");
    }
  },

  async delete(id: string) {
    try {
      return await prisma.collection.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Error) throw new Error(`Failed to delete collection: ${error.message}`);
      throw new Error("Failed to delete collection: Unknown error");
    }
  },
};
