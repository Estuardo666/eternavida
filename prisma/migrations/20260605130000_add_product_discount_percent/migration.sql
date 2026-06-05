-- Add discountPercent column to Product
ALTER TABLE "Product" ADD COLUMN "discountPercent" Decimal(5, 2);

-- Backfill: calculate discount percentage from price and discountPrice
UPDATE "Product"
SET "discountPercent" = CASE
  WHEN "discountPrice" IS NOT NULL
    AND "price" > 0
    AND "discountPrice" < "price"
  THEN ROUND((("price" - "discountPrice") / "price") * 100, 2)
  ELSE 0
END;

-- Set NOT NULL constraint after backfill
ALTER TABLE "Product" ALTER COLUMN "discountPercent" SET DEFAULT 0;
ALTER TABLE "Product" ALTER COLUMN "discountPercent" SET NOT NULL;