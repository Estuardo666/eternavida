export interface PaymentMethodItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  instructions: string | null;
  initialOrderStatus: string | null;
  qrImageUrl: string | null;
  bankName: string | null;
  bankAccountType: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  bankAccountDocument: string | null;
  bankAccountEmail: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodFormData {
  name: string;
  description: string;
  type: string;
  instructions: string;
  initialOrderStatus: string | null;
  qrImageUrl: string;
  bankName: string;
  bankAccountType: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  bankAccountDocument: string;
  bankAccountEmail: string;
  isActive: boolean;
  sortOrder: number;
}

export interface PaymentMethodRouteResponse {
  success: boolean;
  data?: { method: PaymentMethodItem };
  error?: { code: string; message: string };
  timestamp: string;
}

export interface PaymentMethodListRouteResponse {
  success: boolean;
  data?: { methods: PaymentMethodItem[] };
  error?: { code: string; message: string };
  timestamp: string;
}

export interface PublicPaymentMethod {
  id: string;
  name: string;
  type: string;
  description: string | null;
  instructions: string | null;
  initialOrderStatus: string | null;
  qrImageUrl: string | null;
  bankName: string | null;
  bankAccountType: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  bankAccountDocument: string | null;
  bankAccountEmail: string | null;
}

export interface PublicPaymentMethodListRouteResponse {
  success: boolean;
  data?: { methods: PublicPaymentMethod[] };
  error?: { code: string; message: string };
  timestamp: string;
}
