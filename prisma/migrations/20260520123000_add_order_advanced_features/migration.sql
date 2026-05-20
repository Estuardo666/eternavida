-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('web', 'api', 'manual');

-- CreateEnum
CREATE TYPE "OrderNoteVisibility" AS ENUM ('internal', 'customer');

-- CreateEnum
CREATE TYPE "WebhookEventStatus" AS ENUM ('pending', 'delivered', 'failed', 'retrying');

-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN "trackingNumber" TEXT,
ADD COLUMN "trackingUrl" TEXT,
ADD COLUMN "source" "OrderSource" NOT NULL DEFAULT 'web',
ADD COLUMN "externalOrderId" TEXT,
ADD COLUMN "syncedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "OrderNote" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "visibility" "OrderNoteVisibility" NOT NULL DEFAULT 'internal',
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OrderNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderTimeline" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "metadata" JSONB,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OrderTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalApiConfig" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "webhookUrl" TEXT,
  "secretToken" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "retryAttempts" INTEGER NOT NULL DEFAULT 3,
  "timeoutMs" INTEGER NOT NULL DEFAULT 10000,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ExternalApiConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "WebhookEventStatus" NOT NULL DEFAULT 'pending',
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "lastAttemptAt" TIMESTAMP(3),
  "lastResponseStatus" INTEGER,
  "lastResponseBody" TEXT,
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_externalOrderId_key" ON "Order"("externalOrderId");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");

-- CreateIndex
CREATE INDEX "Order_source_idx" ON "Order"("source");

-- CreateIndex
CREATE INDEX "Order_syncedAt_idx" ON "Order"("syncedAt");

-- CreateIndex
CREATE INDEX "OrderNote_orderId_idx" ON "OrderNote"("orderId");

-- CreateIndex
CREATE INDEX "OrderNote_createdAt_idx" ON "OrderNote"("createdAt");

-- CreateIndex
CREATE INDEX "OrderTimeline_orderId_idx" ON "OrderTimeline"("orderId");

-- CreateIndex
CREATE INDEX "OrderTimeline_eventType_idx" ON "OrderTimeline"("eventType");

-- CreateIndex
CREATE INDEX "OrderTimeline_createdAt_idx" ON "OrderTimeline"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_orderId_idx" ON "WebhookEvent"("orderId");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_idx" ON "WebhookEvent"("status");

-- CreateIndex
CREATE INDEX "WebhookEvent_createdAt_idx" ON "WebhookEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "OrderNote"
ADD CONSTRAINT "OrderNote_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTimeline"
ADD CONSTRAINT "OrderTimeline_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEvent"
ADD CONSTRAINT "WebhookEvent_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
