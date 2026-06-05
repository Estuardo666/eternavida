export const REFERRAL_REWARD_TYPES = ["percent_discount", "fixed_amount"] as const;

export type ReferralRewardType = (typeof REFERRAL_REWARD_TYPES)[number];

export type ReferralProgramData = {
  id: string;
  isEnabled: boolean;
  referrerRewardType: ReferralRewardType;
  referrerRewardValue: number;
  referredRewardType: ReferralRewardType;
  referredRewardValue: number;
  couponDurationDays: number | null;
  maxReferralsPerUser: number | null;
};

export type ReferralCodeData = {
  id: string;
  clerkUserId: string;
  code: string;
  usesCount: number;
  isActive: boolean;
  createdAt: Date;
};

export type ReferralData = {
  id: string;
  referralCodeId: string;
  referredUserId: string | null;
  referredEmail: string;
  status: string;
  referrerCoupon: string | null;
  referredCoupon: string | null;
  rewardedAt: Date | null;
  createdAt: Date;
};
