import "server-only";

import { listPaymentMethods } from "@/server/payment/payment-method.repository";
import type { PaymentMethodItem } from "@/types/admin-payment-methods";

export async function getAdminPaymentMethods(): Promise<PaymentMethodItem[]> {
  return listPaymentMethods();
}
