-- Datafast (OPPWA) payment tracking fields
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentCheckoutId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentTransactionId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentResultCode" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentResultDescription" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentAuthCode" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentCardLast4" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentCardBrand" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentPaidAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentRaw" JSONB;

CREATE INDEX IF NOT EXISTS "Order_paymentCheckoutId_idx" ON "Order"("paymentCheckoutId");
