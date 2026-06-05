import "server-only";
import { referralRepository } from "@/server/referral/referral.repository";
import { prisma } from "@/server/db/prisma";
import { PromotionTriggerType } from "@prisma/client";

export async function generateReferralCodeService(clerkUserId: string) {
  return await referralRepository.generateCode(clerkUserId);
}

export async function processReferralRegistrationService(
  referredEmail: string,
  referredUserId: string,
) {
  const referral = await referralRepository.findPendingReferralByEmail(referredEmail);
  if (!referral) return null;

  await referralRepository.updateReferral(referral.id, {
    status: "registered",
    referredUserId,
  });

  const program = await referralRepository.getProgram();
  if (!program.isEnabled) return referral;

  if (Number(program.referredRewardValue) > 0) {
    const couponCode = `BIENVENIDO-${referredUserId.slice(0, 6).toUpperCase()}`;
    const discountPercent =
      program.referredRewardType === "percent_discount"
        ? Number(program.referredRewardValue)
        : null;
    const discountAmount =
      program.referredRewardType === "fixed_amount"
        ? Number(program.referredRewardValue)
        : null;

    await prisma.promotion.create({
      data: {
        name: `Descuento por referido - ${referredEmail}`,
        description: "Descuento de bienvenida por programa de referidos",
        isActive: true,
        triggerType: PromotionTriggerType.coupon,
        couponCode,
        ruleType: "nth_item_percentage",
        stackingMode: "exclusive",
        priority: 10,
        config: {
          position: 1,
          percentOff: discountPercent ?? 10,
          ...(program.couponDurationDays && {
            startsAt: new Date().toISOString(),
            endsAt: new Date(
              Date.now() + program.couponDurationDays * 24 * 60 * 60 * 1000,
            ).toISOString(),
          }),
        },
      },
    });

    await referralRepository.updateReferral(referral.id, {
      referredCoupon: couponCode,
    });
  }

  return referral;
}

export async function processReferralPurchaseService(
  clerkUserId: string,
  orderId: string,
) {
  const referral = await referralRepository.findPendingReferralByEmail("");
  const referrals = await prisma.referral.findMany({
    where: {
      referredUserId: clerkUserId,
      status: "registered",
    },
    include: { referralCode: true },
  });

  if (referrals.length === 0) return null;

  const firstReferral = referrals[0];
  if (!firstReferral) return null;

  await referralRepository.updateReferral(firstReferral.id, {
    status: "purchased",
  });

  const program = await referralRepository.getProgram();
  if (!program.isEnabled) return firstReferral;

  if (Number(program.referrerRewardValue) > 0) {
    const referrerCode = await referralRepository.getCodeByCode(
      firstReferral.referralCode.code,
    );
    if (!referrerCode) return firstReferral;

    const couponCode = `REFER-${referrerCode.clerkUserId.slice(0, 6).toUpperCase()}`;
    const discountPercent =
      program.referrerRewardType === "percent_discount"
        ? Number(program.referrerRewardValue)
        : null;

    await prisma.promotion.create({
      data: {
        name: `Recompensa por referido - ${referrerCode.clerkUserId}`,
        description: "Recompensa por referir a un amigo",
        isActive: true,
        triggerType: PromotionTriggerType.coupon,
        couponCode,
        ruleType: "nth_item_percentage",
        stackingMode: "exclusive",
        priority: 10,
        config: {
          position: 1,
          percentOff: discountPercent ?? 10,
          ...(program.couponDurationDays && {
            startsAt: new Date().toISOString(),
            endsAt: new Date(
              Date.now() + program.couponDurationDays * 24 * 60 * 60 * 1000,
            ).toISOString(),
          }),
        },
      },
    });

    await referralRepository.updateReferral(firstReferral.id, {
      status: "rewarded",
      referrerCoupon: couponCode,
      rewardedAt: new Date(),
    });

    await referralRepository.incrementCodeUses(firstReferral.referralCodeId);

    try {
      const { sendTransactionalEmail } = await import(
        "@/server/email/email-sender.service"
      );
      const { referralRewardTemplate } = await import(
        "@/server/email/referral-reward.template"
      );

      await sendTransactionalEmail({
        to: referrerCode.clerkUserId,
        templateKey: "referral-reward",
        subject: "¡Tu amigo se registró! Aquí está tu recompensa",
        html: referralRewardTemplate({
          couponCode,
          rewardDescription:
            program.referrerRewardType === "percent_discount"
              ? `${program.referrerRewardValue}% de descuento`
              : `$${program.referrerRewardValue} de descuento`,
        }),
      });
    } catch (error) {
      console.error("Failed to send referral reward email:", error);
    }
  }

  return firstReferral;
}

export async function getReferralStatsService(clerkUserId: string) {
  const code = await referralRepository.getCodeByUser(clerkUserId);
  if (!code) {
    return { code: null, referrals: [], stats: { total: 0, pending: 0, rewarded: 0 } };
  }

  const referrals = await prisma.referral.findMany({
    where: { referralCodeId: code.id },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === "pending" || r.status === "registered").length,
    rewarded: referrals.filter((r) => r.status === "rewarded").length,
  };

  return {
    code: code.code,
    referrals: referrals.map((r) => ({
      id: r.id,
      email: r.referredEmail,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
    stats,
  };
}
