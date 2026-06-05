export const SUBSCRIPTION_FREQUENCIES = ["days_15", "days_30", "days_45", "days_60", "days_90"] as const;
export const SUBSCRIPTION_STATUSES = ["active", "paused", "cancelled", "expired"] as const;

export type SubscriptionFrequency = (typeof SUBSCRIPTION_FREQUENCIES)[number];
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const FREQUENCY_DAYS: Record<SubscriptionFrequency, number> = {
  days_15: 15,
  days_30: 30,
  days_45: 45,
  days_60: 60,
  days_90: 90,
};

export const FREQUENCY_LABELS: Record<SubscriptionFrequency, string> = {
  days_15: "Cada 15 días",
  days_30: "Cada 30 días",
  days_45: "Cada 45 días",
  days_60: "Cada 60 días",
  days_90: "Cada 90 días",
};
