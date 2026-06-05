/**
 * Apply search optimization migrations
 *
 * This script applies the database changes needed for optimized search:
 *   1. Prisma migration: adds discountPercent column + backfill
 *   2. Prisma generate: regenerates the client
 *   3. SQL script: creates pg_trgm GIN indexes (outside transactions)
 *
 * Usage:
 *   node scripts/apply-search-optimizations.js
 *
 * Or run steps manually:
 *   npx prisma migrate deploy
 *   npx prisma db execute --file scripts/add-search-indexes.sql --schema prisma/schema.prisma
 */

const { execSync } = require("child_process");

const STEP_PREFIX = "[search-optimization]";

function run(command, description) {
  console.log(`${STEP_PREFIX} ${description}...`);
  console.log(`${STEP_PREFIX} > ${command}`);
  try {
    const output = execSync(command, { encoding: "utf-8", stdio: "inherit" });
    console.log(`${STEP_PREFIX} ✓ ${description} completed.`);
    return true;
  } catch (error) {
    console.error(`${STEP_PREFIX} ✗ ${description} failed.`);
    console.error(error.message);
    return false;
  }
}

function main() {
  console.log(`${STEP_PREFIX} Applying search optimizations...`);
  console.log();

  // Step 1: Run Prisma migrations (discountPercent column)
  if (!run("npx prisma migrate deploy", "Step 1: Prisma migrations (discountPercent column)")) {
    process.exit(1);
  }

  // Step 2: Regenerate Prisma Client
  if (!run("npx prisma generate", "Step 2: Regenerate Prisma Client")) {
    process.exit(1);
  }

  // Step 3: Apply pg_trgm GIN indexes (outside transactions)
  if (!run(
    "npx prisma db execute --file scripts/add-search-indexes.sql --schema prisma/schema.prisma",
    "Step 3: Create pg_trgm GIN indexes",
  )) {
    console.warn(`${STEP_PREFIX} ⚠ GIN indexes may have failed. This is non-blocking — search will still work, just slower.`);
    console.warn(`${STEP_PREFIX}   You can retry manually: npx prisma db execute --file scripts/add-search-indexes.sql --schema prisma/schema.prisma`);
  }

  console.log();
  console.log(`${STEP_PREFIX} Done. Search optimizations applied.`);
}

main();