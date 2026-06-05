export type RestockAlert = {
  id: string;
  email: string;
  productId: string;
  notifiedAt: Date | null;
  createdAt: Date;
};

export type RestockAlertSettingsData = {
  id: string;
  isEnabled: boolean;
  emailSubject: string;
  maxAlertsPerProduct: number;
  expiresAfterDays: number;
};
