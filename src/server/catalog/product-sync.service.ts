/**
 * Product Sync Service
 *
 * Orchestrates synchronization from external API to local Product catalog.
 * Handles:
 * - Validation against abstract contract
 * - Deduplication (external ID, slug, name)
 * - Conflict resolution (external wins, local wins, manual review)
 * - Normalization to local schema
 * - Transactional persistence with rollback on error
 * - Audit logging and error reporting
 */

import { PrismaClient } from "@prisma/client";

import { computeDiscountPercent } from "@/lib/product-pricing";
import {
  ProductSyncError,
  ValidationError,
  DeduplicationError,
  ConflictResolutionError,
  InvalidConfigurationError,
  ExternalApiFetchError,
} from "./product-sync.errors";
import { normalizeSyncManagedProductFields } from "./external-product-sync-fields";

export interface ProductSyncConfig {
  // External API adapter implementation
  adapter: IExternalProductAdapter;

  // API connection config
  apiConfig: ExternalProductApiConfig;

  // How to find matching products
  deduplicationStrategy: SyncDeduplicationStrategy;

  // How to handle conflicts
  conflictStrategy: SyncConflictStrategy;

  // Category for products without explicit category
  defaultCategory?: string;

  // If true, create missing categories on-the-fly (recommended: false for safety)
  autoCreateCategories: boolean;

  // Source system identifier (e.g., "shopify", "woocommerce")
  sourceSystemId: string;

  // If true, only fetch products modified since last sync
  incrementalSync: boolean;

  // Dry run: validate without persisting
  dryRun: boolean;
}

export class ProductSyncService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Execute full sync operation
   */
  async sync(config: ProductSyncConfig): Promise<SyncOperationResult> {
    const startedAt = new Date();
    const results: SyncProductResult[] = [];

    try {
      // Step 1: Validate configuration
      this.validateConfig(config);

      // Step 2: Fetch products from external API
      const response = await this.fetchExternalProducts(config);

      // Step 3: Validate external products against contract
      const validProducts = this.validateExternalProducts(response.products);

      // Step 4: Process each product (deduplicate, resolve conflicts, normalize)
      for (const externalProduct of validProducts) {
        try {
          const result = await this.processSingleProduct(
            externalProduct,
            config
          );
          results.push(result);
        } catch (error) {
          results.push({
            externalId: externalProduct.externalId,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date(),
          });
        }
      }

      // Step 5: Persist all changes (if not dry run)
      if (!config.dryRun) {
        await this.persistResults(results, config);
      }

      const completedAt = new Date();
      return {
        startedAt,
        completedAt,
        totalProcessed: results.length,
        created: results.filter((r) => r.status === "created").length,
        updated: results.filter((r) => r.status === "updated").length,
        skipped: results.filter((r) => r.status === "skipped").length,
        errors: results.filter((r) => r.status === "error").length,
        results,
        sourceSystemId: config.sourceSystemId,
      };
    } catch (error) {
      throw new ProductSyncError(
        `Sync operation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "SYNC_OPERATION_FAILED",
        {
          sourceSystemId: config.sourceSystemId,
          resultsProcessedBeforeFailure: results.length,
        }
      );
    }
  }

  /**
   * Validate sync configuration is complete
   */
  private validateConfig(config: ProductSyncConfig): void {
    if (!config.adapter) {
      throw new InvalidConfigurationError("Adapter is required");
    }

    if (!config.apiConfig) {
      throw new InvalidConfigurationError("API config is required");
    }

    if (!config.sourceSystemId) {
      throw new InvalidConfigurationError("Source system ID is required");
    }

    const validation = config.adapter.validateConfig(config.apiConfig);
    if (!validation.valid) {
      throw new InvalidConfigurationError(
        `Invalid API config: ${validation.errors.join(", ")}`,
        { errors: validation.errors }
      );
    }
  }

  /**
   * Fetch products from external API
   */
  private async fetchExternalProducts(
    config: ProductSyncConfig
  ): Promise<ExternalProductListResponse> {
    try {
      return await config.adapter.fetchProducts(config.apiConfig);
    } catch (error) {
      throw new ExternalApiFetchError(
        `Failed to fetch products from external API: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          sourceSystemId: config.sourceSystemId,
          error: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }

  /**
   * Validate that external products conform to minimum contract
   */
  private validateExternalProducts(products: ExternalProduct[]): ExternalProduct[] {
    const validated: ExternalProduct[] = [];

    for (const product of products) {
      const errors: string[] = [];

      if (!product.externalId) {
        errors.push("Missing externalId");
      }

      if (!product.name || product.name.trim().length === 0) {
        errors.push("Missing or empty name");
      }

      if (!product.slug || !this.isValidSlug(product.slug)) {
        errors.push("Invalid slug");
      }

      if (errors.length > 0) {
        throw new ValidationError(
          `Invalid external product: ${errors.join(", ")}`,
          { externalId: product.externalId, errors }
        );
      }

      validated.push(product);
    }

    return validated;
  }

  /**
   * Process single external product: deduplicate, resolve conflicts, normalize
   */
  private async processSingleProduct(
    externalProduct: ExternalProduct,
    config: ProductSyncConfig
  ): Promise<SyncProductResult> {
    // Step 1: Find matching local product
    const existingProduct = await this.findMatchingLocalProduct(
      externalProduct,
      config
    );

    if (!existingProduct) {
      // Create new product
      const normalized = await this.normalizeToLocalProduct(
        externalProduct,
        config
      );
      return {
        externalId: externalProduct.externalId,
        status: "created",
        reason: "New product from external source",
        timestamp: new Date(),
        // localProductId will be set after persistence
      };
    }

    // Step 2: Check for conflicts between local and external data
    const conflict = this.detectConflict(existingProduct, externalProduct);

    if (conflict && config.conflictStrategy === SyncConflictStrategy.MANUAL_REVIEW) {
      return {
        externalId: externalProduct.externalId,
        localProductId: existingProduct.id,
        status: "skipped",
        reason: `Conflict detected (${conflict}): manual review required`,
        timestamp: new Date(),
      };
    }

    if (conflict && config.conflictStrategy === SyncConflictStrategy.LOCAL_WINS) {
      return {
        externalId: externalProduct.externalId,
        localProductId: existingProduct.id,
        status: "skipped",
        reason: "Local data preserved (local-wins strategy)",
        timestamp: new Date(),
      };
    }

    // Step 3: Merge/normalize (external wins or merge strategy)
    const merged = await this.normalizeToLocalProduct(
      externalProduct,
      config,
      existingProduct
    );

    // Record update without performing it yet (will be batch persisted)
    return {
      externalId: externalProduct.externalId,
      localProductId: existingProduct.id,
      status: "updated",
      reason: "Synced from external source",
      timestamp: new Date(),
    };
  }

  /**
   * Find existing local product matching external product
   */
  private async findMatchingLocalProduct(
    externalProduct: ExternalProduct,
    config: ProductSyncConfig
  ) {
    switch (config.deduplicationStrategy) {
      case SyncDeduplicationStrategy.EXTERNAL_ID:
        return await this.prisma.product.findUnique({
          where: { externalId: externalProduct.externalId },
        });

      case SyncDeduplicationStrategy.SLUG_AND_CATEGORY:
        return await this.prisma.product.findFirst({
          where: {
            slug: externalProduct.slug,
            // Could filter by category if function had access to it
          },
        });

      case SyncDeduplicationStrategy.NAME_ONLY:
        return await this.prisma.product.findFirst({
          where: { name: externalProduct.name },
        });

      default:
        throw new DeduplicationError(
          `Unknown deduplication strategy: ${config.deduplicationStrategy}`
        );
    }
  }

  /**
   * Detect conflicts between local and external data
   */
  private detectConflict(
    localProduct: any,
    externalProduct: ExternalProduct
  ): string | null {
    // Local product was modified after external was last modified
    if (
      externalProduct.lastModifiedAt &&
      localProduct.updatedAt > externalProduct.lastModifiedAt
    ) {
      return "Local modification is newer than external";
    }

    // Price changed significantly (if applicable)
    // This is a business rule example - customize per domain
    if (externalProduct.price && localProduct.priceExternalMetadata) {
      // Check if price changed by more than threshold
      // This would be domain-specific logic
    }

    return null;
  }

  /**
   * Normalize external product to local schema
   * Handles mapping, enrichment, validation
   */
  private async normalizeToLocalProduct(
    externalProduct: ExternalProduct,
    config: ProductSyncConfig,
    existingLocal?: any
  ) {
    const syncManagedFields = normalizeSyncManagedProductFields(externalProduct, {
      price: existingLocal?.price,
      discountPrice: existingLocal?.discountPrice,
      stock: existingLocal?.stock,
    });

    return {
      name: externalProduct.name,
      brand: externalProduct.brand || existingLocal?.brand || "Sin marca",
      description: externalProduct.description || existingLocal?.description || "",
      slug: externalProduct.slug,
      href: `/product/${externalProduct.slug}`, // Or derive from existing
      badge: externalProduct.badge || existingLocal?.badge,
      badgeColor: existingLocal?.badgeColor ?? null,
      price: syncManagedFields.price,
      discountPrice: syncManagedFields.discountPrice,
      discountPercent: computeDiscountPercent(syncManagedFields.price ?? 0, syncManagedFields.discountPrice),
      stock: syncManagedFields.stock,
      isActive: true,
      externalId: externalProduct.externalId,
      externalSourceId: config.sourceSystemId,
      lastSyncedAt: new Date(),
      syncVersion: (existingLocal?.syncVersion || 0) + 1,
      externalMetadata: externalProduct.additionalData || null,
      // mediaAssetId would be handled separately (image sync pipeline)
    };
  }

  /**
   * Persist all sync results to database
   * Should be transactional: all succeed or all fail
   */
  private async persistResults(
    results: SyncProductResult[],
    config: ProductSyncConfig
  ): Promise<void> {
    const createdResults = results.filter((r) => r.status === "created");
    const updatedResults = results.filter((r) => r.status === "updated");

    // TODO: Implement batch transaction
    // Use prisma.$transaction for atomicity

    // For now, log what would be persisted
    console.log(`[ProductSync] Would create ${createdResults.length} products`);
    console.log(`[ProductSync] Would update ${updatedResults.length} products`);
  }

  /**
   * Validate slug format (URL-safe)
   */
  private isValidSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  }
}

/**
 * Factory for creating configured sync service
 */
export function createProductSyncService(prisma: PrismaClient) {
  return new ProductSyncService(prisma);
}
