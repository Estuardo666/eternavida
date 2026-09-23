-- Bank account details and QR image for offline payment methods
ALTER TABLE "PaymentMethod" ADD COLUMN IF NOT EXISTS "qrImageUrl" TEXT;
ALTER TABLE "PaymentMethod" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
ALTER TABLE "PaymentMethod" ADD COLUMN IF NOT EXISTS "bankAccountType" TEXT;
ALTER TABLE "PaymentMethod" ADD COLUMN IF NOT EXISTS "bankAccountNumber" TEXT;
ALTER TABLE "PaymentMethod" ADD COLUMN IF NOT EXISTS "bankAccountHolder" TEXT;
ALTER TABLE "PaymentMethod" ADD COLUMN IF NOT EXISTS "bankAccountDocument" TEXT;
ALTER TABLE "PaymentMethod" ADD COLUMN IF NOT EXISTS "bankAccountEmail" TEXT;
