import "server-only";

import type { Prisma } from "@prisma/client";

import { env } from "@/config/env";
import { computeDiscountPercent } from "@/lib/product-pricing";
import { mapAdminProductItem } from "@/services/admin-catalog/get-catalog-admin-data";
import { GenericRestApiAdapter } from "@/server/catalog/external-api-adapters";
import { findAdminProductRecord } from "@/server/catalog/admin-catalog.repository";
import { normalizeSyncManagedProductFields } from "@/server/catalog/external-product-sync-fields";
import { prisma } from "@/server/db/prisma";
import type {
  AdminProductSyncCapabilities,
  AdminProductSyncHistoryItem,
  AdminProductSyncRequest,
  AdminProductSyncResult,
  AdminProductRouteResponse,
} from "@/types/admin-catalog";
import type { ExternalProduct, ExternalProductApiConfig } from "@/types/external-product-api";

const MOCK_SYNC_SOURCE_SYSTEM_ID = "mock-provider";
const DEFAULT_LIVE_SYNC_SOURCE_SYSTEM_ID = "external-api";

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeMetadataRecord(value: Prisma.JsonValue | null): Prisma.InputJsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Prisma.InputJsonObject;
}

function normalizeSyncHistoryEntries(value: unknown): AdminProductSyncHistoryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return [];
    }

    const item = entry as Record<string, unknown>;
    const mode = item.mode === "live" ? "live" : item.mode === "mock" ? "mock" : null;
    const sourceSystemId = typeof item.sourceSystemId === "string" ? item.sourceSystemId : null;
    const syncedAt = typeof item.syncedAt === "string" ? item.syncedAt : null;
    const isSimulation = typeof item.isSimulation === "boolean" ? item.isSimulation : mode === "mock";
    const price = typeof item.price === "number" ? item.price : null;
    const discountPrice = item.discountPrice === null || typeof item.discountPrice === "number" ? item.discountPrice : null;
    const stock = typeof item.stock === "number" ? item.stock : null;

    if (!mode || !sourceSystemId || !syncedAt || price === null || stock === null) {
      return [];
    }

    return [{
      mode,
      sourceSystemId,
      syncedAt,
      isSimulation,
      price,
      discountPrice,
      stock,
    }];
  });
}

function isLiveSyncConfigured(): boolean {
  return Boolean(
    env.EXTERNAL_PRODUCT_SYNC_ENDPOINT &&
    (env.EXTERNAL_PRODUCT_SYNC_BEARER_TOKEN || env.EXTERNAL_PRODUCT_SYNC_API_KEY),
  );
}

function buildLiveSyncConfig(): ExternalProductApiConfig {
  if (!env.EXTERNAL_PRODUCT_SYNC_ENDPOINT) {
    throw new Error("Live sync endpoint is not configured.");
  }

  const token = env.EXTERNAL_PRODUCT_SYNC_BEARER_TOKEN;
  const apiKey = env.EXTERNAL_PRODUCT_SYNC_API_KEY;
  if (!token && !apiKey) {
    throw new Error("Live sync credentials are not configured.");
  }

  const auth = token
    ? {
        type: "bearer" as const,
        credentials: {
          token,
        },
      }
    : {
        type: "api-key" as const,
        credentials: {
          apiKey: apiKey as string,
        },
      };

  return {
    endpoint: env.EXTERNAL_PRODUCT_SYNC_ENDPOINT,
    auth,
  };
}

export function getAdminProductSyncCapabilities(): AdminProductSyncCapabilities {
  const liveAvailable = isLiveSyncConfigured();

  return {
    defaultMode: "mock",
    options: [
      {
        mode: "mock",
        label: "Simulación segura",
        available: true,
        description: "Prueba el flujo completo sin depender del proveedor real.",
      },
      {
        mode: "live",
        label: "Proveedor real",
        available: liveAvailable,
        description: liveAvailable
          ? "Consulta el proveedor externo usando la configuración del entorno."
          : "Disponible cuando se configure endpoint y credenciales del proveedor.",
      },
    ],
  };
}

function buildMockExternalProduct(product: Awaited<ReturnType<typeof findAdminProductRecord>> extends infer T ? NonNullable<T> : never): ExternalProduct {
  const nextSyncVersion = product.syncVersion + 1;
  const regularPriceSeed = product.price.toNumber();
  const basePrice = regularPriceSeed > 0 ? regularPriceSeed : 999;
  const nextPrice = roundCurrency(basePrice + 17.5 + (nextSyncVersion % 3) * 6.25);
  const shouldApplyDiscount = nextSyncVersion % 2 === 0;
  const nextDiscountPrice = shouldApplyDiscount
    ? roundCurrency(Math.max(0, nextPrice - 48.5))
    : null;
  const stockOffset = [14, -3, 8, 0][nextSyncVersion % 4] ?? 0;
  const nextStock = Math.max(0, product.stock + stockOffset);
  const categoryName = product.category?.name;

  return {
    externalId: product.externalId ?? `mock-${product.id}`,
    name: product.name,
    brand: product.brand,
    description: product.description,
    slug: product.slug,
    ...(categoryName ? { category: categoryName } : {}),
    price: {
      amount: nextPrice,
      currency: "MXN",
    },
    ...(nextDiscountPrice !== null
      ? {
          discountPrice: {
            amount: nextDiscountPrice,
            currency: "MXN",
          },
        }
      : {}),
    availability: {
      inStock: nextStock > 0,
      quantity: nextStock,
    },
    ...(product.badge ? { badge: product.badge } : {}),
    additionalData: {
      simulation: true,
      scenario: "single-product-admin-sync",
      generatedAt: new Date().toISOString(),
      sourceProductId: product.id,
    },
    lastModifiedAt: new Date(),
  };
}

async function buildExternalProductForMode(
  product: Awaited<ReturnType<typeof findAdminProductRecord>> extends infer T ? NonNullable<T> : never,
  mode: "mock" | "live",
): Promise<{ externalProduct: ExternalProduct; sourceSystemId: string; isSimulation: boolean }> {
  if (mode === "mock") {
    return {
      externalProduct: buildMockExternalProduct(product),
      sourceSystemId: MOCK_SYNC_SOURCE_SYSTEM_ID,
      isSimulation: true,
    };
  }

  if (!product.externalId) {
    throw new Error("Product needs an externalId before live sync can run.");
  }

  const adapter = new GenericRestApiAdapter();
  const config = buildLiveSyncConfig();
  const externalProduct = await adapter.fetchProductById(product.externalId, config);

  return {
    externalProduct,
    sourceSystemId: env.EXTERNAL_PRODUCT_SYNC_SOURCE_SYSTEM_ID ?? DEFAULT_LIVE_SYNC_SOURCE_SYSTEM_ID,
    isSimulation: false,
  };
}

export async function syncSingleAdminProduct(
  id: string,
  input: AdminProductSyncRequest = { mode: "mock" },
): Promise<{ product: NonNullable<AdminProductRouteResponse["data"]>["product"]; sync: AdminProductSyncResult }> {
  if (input.mode && input.mode !== "mock" && input.mode !== "live") {
    throw new Error("Unsupported sync mode.");
  }

  const existingProduct = await findAdminProductRecord(id);
  if (!existingProduct) {
    throw new Error("Product not found.");
  }

  const mode = input.mode ?? "mock";
  const { externalProduct, sourceSystemId, isSimulation } = await buildExternalProductForMode(existingProduct, mode);
  const normalizedFields = normalizeSyncManagedProductFields(externalProduct, {
    price: existingProduct.price,
    discountPrice: existingProduct.discountPrice,
    stock: existingProduct.stock,
  });
  const syncedAt = new Date();
  const existingMetadata = normalizeMetadataRecord(existingProduct.externalMetadata as Prisma.JsonValue | null);
  const existingHistory = normalizeSyncHistoryEntries(existingMetadata.syncHistory);
  const nextHistoryEntry: AdminProductSyncHistoryItem = {
    mode,
    sourceSystemId,
    syncedAt: syncedAt.toISOString(),
    isSimulation,
    price: normalizedFields.price,
    discountPrice: normalizedFields.discountPrice,
    stock: normalizedFields.stock,
  };
  const nextHistory = [nextHistoryEntry, ...existingHistory].slice(0, 12);
  const nextExternalMetadata: Prisma.InputJsonObject = {
    ...existingMetadata,
    syncHistory: nextHistory.map((entry) => ({
      mode: entry.mode,
      sourceSystemId: entry.sourceSystemId,
      syncedAt: entry.syncedAt,
      isSimulation: entry.isSimulation,
      price: entry.price,
      discountPrice: entry.discountPrice,
      stock: entry.stock,
    })),
    lastSingleProductSync: {
      mode,
      sourceSystemId,
      syncedAt: syncedAt.toISOString(),
      isSimulation,
      normalizedFields: {
        price: normalizedFields.price,
        discountPrice: normalizedFields.discountPrice,
        stock: normalizedFields.stock,
      },
      payload: {
        externalId: externalProduct.externalId,
        price: externalProduct.price
          ? {
              amount: externalProduct.price.amount,
              currency: externalProduct.price.currency,
            }
          : null,
        discountPrice: externalProduct.discountPrice
          ? {
              amount: externalProduct.discountPrice.amount,
              currency: externalProduct.discountPrice.currency,
            }
          : null,
        availability: externalProduct.availability
          ? {
              inStock: externalProduct.availability.inStock,
              ...(externalProduct.availability.quantity !== undefined
                ? { quantity: externalProduct.availability.quantity }
                : {}),
            }
          : null,
      },
    },
  };

  await prisma.product.update({
    where: {
      id,
    },
    data: {
      price: normalizedFields.price,
      discountPrice: normalizedFields.discountPrice,
      discountPercent: computeDiscountPercent(normalizedFields.price, normalizedFields.discountPrice),
      stock: normalizedFields.stock,
      externalId: existingProduct.externalId ?? externalProduct.externalId,
      externalSourceId: sourceSystemId,
      lastSyncedAt: syncedAt,
      syncVersion: {
        increment: 1,
      },
      externalMetadata: nextExternalMetadata,
    },
  });

  const updatedProduct = await findAdminProductRecord(id);
  if (!updatedProduct) {
    throw new Error("Failed to reload synced product.");
  }

  return {
    product: mapAdminProductItem(updatedProduct),
    sync: {
      mode,
      sourceSystemId,
      syncedAt: syncedAt.toISOString(),
      isSimulation,
    },
  };
}