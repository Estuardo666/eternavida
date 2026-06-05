-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "AbandonedCartStatus" AS ENUM ('active', 'recovered', 'expired');

-- CreateEnum
CREATE TYPE "ReferralRewardType" AS ENUM ('percent_discount', 'fixed_amount');

-- CreateEnum
CREATE TYPE "SubscriptionFrequency" AS ENUM ('days_15', 'days_30', 'days_45', 'days_60', 'days_90');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'paused', 'cancelled', 'expired');

-- CreateTable: Review
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "status" "ReviewStatus" NOT NULL DEFAULT 'pending',
    "adminResponse" TEXT,
    "adminRespondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Review
CREATE UNIQUE INDEX "Review_productId_clerkUserId_key" ON "Review"("productId", "clerkUserId");
CREATE INDEX "Review_productId_idx" ON "Review"("productId");
CREATE INDEX "Review_clerkUserId_idx" ON "Review"("clerkUserId");
CREATE INDEX "Review_status_idx" ON "Review"("status");
CREATE INDEX "Review_isVerifiedPurchase_idx" ON "Review"("isVerifiedPurchase");
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- AddForeignKey: Review -> Product
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: WishlistItem
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: WishlistItem
CREATE UNIQUE INDEX "WishlistItem_clerkUserId_productId_key" ON "WishlistItem"("clerkUserId", "productId");
CREATE INDEX "WishlistItem_clerkUserId_idx" ON "WishlistItem"("clerkUserId");
CREATE INDEX "WishlistItem_productId_idx" ON "WishlistItem"("productId");
CREATE INDEX "WishlistItem_createdAt_idx" ON "WishlistItem"("createdAt");

-- AddForeignKey: WishlistItem -> Product
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: AbandonedCart
CREATE TABLE "AbandonedCart" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "cartData" JSONB NOT NULL,
    "status" "AbandonedCartStatus" NOT NULL DEFAULT 'active',
    "lastActivityAt" TIMESTAMP(3) NOT NULL,
    "recoveryStep" INTEGER NOT NULL DEFAULT 0,
    "recoveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbandonedCart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: AbandonedCart
CREATE INDEX "AbandonedCart_clerkUserId_idx" ON "AbandonedCart"("clerkUserId");
CREATE INDEX "AbandonedCart_guestEmail_idx" ON "AbandonedCart"("guestEmail");
CREATE INDEX "AbandonedCart_status_idx" ON "AbandonedCart"("status");
CREATE INDEX "AbandonedCart_lastActivityAt_idx" ON "AbandonedCart"("lastActivityAt");
CREATE INDEX "AbandonedCart_createdAt_idx" ON "AbandonedCart"("createdAt");

-- CreateTable: AbandonedCartRecoveryLog
CREATE TABLE "AbandonedCartRecoveryLog" (
    "id" TEXT NOT NULL,
    "abandonedCartId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "emailSentAt" TIMESTAMP(3) NOT NULL,
    "clickedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "AbandonedCartRecoveryLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: AbandonedCartRecoveryLog
CREATE INDEX "AbandonedCartRecoveryLog_abandonedCartId_idx" ON "AbandonedCartRecoveryLog"("abandonedCartId");
CREATE INDEX "AbandonedCartRecoveryLog_step_idx" ON "AbandonedCartRecoveryLog"("step");
CREATE INDEX "AbandonedCartRecoveryLog_emailSentAt_idx" ON "AbandonedCartRecoveryLog"("emailSentAt");

-- AddForeignKey: AbandonedCartRecoveryLog -> AbandonedCart
ALTER TABLE "AbandonedCartRecoveryLog" ADD CONSTRAINT "AbandonedCartRecoveryLog_abandonedCartId_fkey" FOREIGN KEY ("abandonedCartId") REFERENCES "AbandonedCart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: AbandonedCartSettings
CREATE TABLE "AbandonedCartSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "steps" JSONB NOT NULL,
    "maxRecoverySteps" INTEGER NOT NULL DEFAULT 3,
    "includeDiscount" BOOLEAN NOT NULL DEFAULT false,
    "discountPercent" DECIMAL(5,2),
    "couponPrefix" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbandonedCartSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: RestockAlert
CREATE TABLE "RestockAlert" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestockAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: RestockAlert
CREATE UNIQUE INDEX "RestockAlert_email_productId_key" ON "RestockAlert"("email", "productId");
CREATE INDEX "RestockAlert_productId_idx" ON "RestockAlert"("productId");
CREATE INDEX "RestockAlert_notifiedAt_idx" ON "RestockAlert"("notifiedAt");
CREATE INDEX "RestockAlert_createdAt_idx" ON "RestockAlert"("createdAt");

-- AddForeignKey: RestockAlert -> Product
ALTER TABLE "RestockAlert" ADD CONSTRAINT "RestockAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: RestockAlertSettings
CREATE TABLE "RestockAlertSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailSubject" TEXT NOT NULL DEFAULT '¡Tu producto está disponible!',
    "maxAlertsPerProduct" INTEGER NOT NULL DEFAULT 500,
    "expiresAfterDays" INTEGER NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestockAlertSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ReferralProgram
CREATE TABLE "ReferralProgram" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "referrerRewardType" "ReferralRewardType" NOT NULL DEFAULT 'percent_discount',
    "referrerRewardValue" DECIMAL(5,2) NOT NULL,
    "referredRewardType" "ReferralRewardType" NOT NULL DEFAULT 'percent_discount',
    "referredRewardValue" DECIMAL(5,2) NOT NULL,
    "couponDurationDays" INTEGER,
    "maxReferralsPerUser" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ReferralCode
CREATE TABLE "ReferralCode" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "usesCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: ReferralCode
CREATE UNIQUE INDEX "ReferralCode_clerkUserId_key" ON "ReferralCode"("clerkUserId");
CREATE UNIQUE INDEX "ReferralCode_code_key" ON "ReferralCode"("code");
CREATE INDEX "ReferralCode_code_idx" ON "ReferralCode"("code");
CREATE INDEX "ReferralCode_clerkUserId_idx" ON "ReferralCode"("clerkUserId");
CREATE INDEX "ReferralCode_isActive_idx" ON "ReferralCode"("isActive");

-- CreateTable: Referral
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referralCodeId" TEXT NOT NULL,
    "referredUserId" TEXT,
    "referredEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "referrerCoupon" TEXT,
    "referredCoupon" TEXT,
    "rewardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Referral
CREATE INDEX "Referral_referralCodeId_idx" ON "Referral"("referralCodeId");
CREATE INDEX "Referral_referredEmail_idx" ON "Referral"("referredEmail");
CREATE INDEX "Referral_status_idx" ON "Referral"("status");
CREATE INDEX "Referral_createdAt_idx" ON "Referral"("createdAt");

-- AddForeignKey: Referral -> ReferralCode
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Subscription
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "frequency" "SubscriptionFrequency" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "nextOrderAt" TIMESTAMP(3) NOT NULL,
    "lastOrderAt" TIMESTAMP(3),
    "lastOrderId" TEXT,
    "totalCycles" INTEGER NOT NULL DEFAULT 0,
    "maxCycles" INTEGER,
    "paymentMethodToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Subscription
CREATE INDEX "Subscription_clerkUserId_idx" ON "Subscription"("clerkUserId");
CREATE INDEX "Subscription_productId_idx" ON "Subscription"("productId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Subscription_nextOrderAt_idx" ON "Subscription"("nextOrderAt");
CREATE INDEX "Subscription_createdAt_idx" ON "Subscription"("createdAt");

-- AddForeignKey: Subscription -> Product
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: SubscriptionOrder
CREATE TABLE "SubscriptionOrder" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: SubscriptionOrder
CREATE INDEX "SubscriptionOrder_subscriptionId_idx" ON "SubscriptionOrder"("subscriptionId");
CREATE INDEX "SubscriptionOrder_orderId_idx" ON "SubscriptionOrder"("orderId");

-- AddForeignKey: SubscriptionOrder -> Subscription
ALTER TABLE "SubscriptionOrder" ADD CONSTRAINT "SubscriptionOrder_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: SubscriptionSettings
CREATE TABLE "SubscriptionSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reminderDaysBefore" INTEGER NOT NULL DEFAULT 3,
    "autoChargeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderEmailSubject" TEXT,
    "maxSubscriptionsPerUser" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionSettings_pkey" PRIMARY KEY ("id")
);
