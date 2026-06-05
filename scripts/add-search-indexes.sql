-- ============================================================
-- Search Optimization: pg_trgm GIN indexes
-- Run this script OUTSIDE of Prisma migrations because
-- CREATE INDEX CONCURRENTLY cannot run inside a transaction.
--
-- Usage:
--   npx prisma db execute --file scripts/add-search-indexes.sql --schema prisma/schema.prisma
--
-- Or directly with psql:
--   psql "$DATABASE_URL" -f scripts/add-search-indexes.sql
--
-- This script is IDEMPODENT (IF NOT EXISTS / CONCURRENTLY IF NOT EXISTS).
-- ============================================================

-- Enable pg_trgm extension for trigram-based text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Product: search fields (live search + catalog search)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Product_name_trgm_idx"
  ON "Product" USING GIN ("name" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "Product_brand_trgm_idx"
  ON "Product" USING GIN ("brand" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "Product_description_trgm_idx"
  ON "Product" USING GIN ("description" gin_trgm_ops);

-- Category: search field (live search)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Category_name_trgm_idx"
  ON "Category" USING GIN ("name" gin_trgm_ops);

-- Brand: search field (live search)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Brand_name_trgm_idx"
  ON "Brand" USING GIN ("name" gin_trgm_ops);

-- Composite indexes for common query patterns
-- isActive + name (filtered + text search)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Product_isActive_name_idx"
  ON "Product" ("isActive", "name");

-- Category: isActive + name
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Category_isActive_name_idx"
  ON "Category" ("isActive", "name");

-- Product: isActive + discountPercent DESC (highest-discount sort)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Product_isActive_discountPercent_idx"
  ON "Product" ("isActive", "discountPercent" DESC);