/**
 * Apply pg_trgm GIN indexes outside of a transaction.
 *
 * CREATE INDEX CONCURRENTLY cannot run inside a transaction block,
 * so this script uses an autocommit connection (no BEGIN/COMMIT).
 *
 * Usage:
 *   node scripts/apply-search-indexes.js
 */

require("dotenv").config();

const { Client } = require("pg");

const INDEXES = [
  "CREATE EXTENSION IF NOT EXISTS pg_trgm",
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Product_name_trgm_idx" ON "Product" USING GIN ("name" gin_trgm_ops)`,
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Product_brand_trgm_idx" ON "Product" USING GIN ("brand" gin_trgm_ops)`,
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Product_description_trgm_idx" ON "Product" USING GIN ("description" gin_trgm_ops)`,
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Category_name_trgm_idx" ON "Category" USING GIN ("name" gin_trgm_ops)`,
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Brand_name_trgm_idx" ON "Brand" USING GIN ("name" gin_trgm_ops)`,
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Product_isActive_name_idx" ON "Product" ("isActive", "name")`,
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Category_isActive_name_idx" ON "Category" ("isActive", "name")`,
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Product_isActive_discountPercent_idx" ON "Product" ("isActive", "discountPercent" DESC)`,
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[search-indexes] DATABASE_URL environment variable is required.");
    process.exit(1);
  }

  // Neon requires SSL — adjust connection string for pg compatibility
  const connectionString = databaseUrl.includes("sslmode=require")
    ? databaseUrl.replace("sslmode=require", "sslmode=no-verify") + "&ssl=true"
    : databaseUrl;

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("[search-indexes] Connected to database.");

    for (const sql of INDEXES) {
      const label = sql.substring(0, 90).replace(/\n/g, " ");
      console.log(`[search-indexes] Executing: ${label}...`);
      try {
        await client.query({ text: sql });
        console.log(`[search-indexes] ✓ Done.`);
      } catch (error) {
        const msg = error.message || String(error);
        if (msg.includes("already exists")) {
          console.log(`[search-indexes] ✓ Already exists, skipping.`);
        } else {
          console.warn(`[search-indexes] ⚠ ${msg}`);
        }
      }
    }

    console.log("\n[search-indexes] All search indexes applied successfully.");
  } catch (error) {
    console.error("[search-indexes] Failed:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();