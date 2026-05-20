import "server-only";

import { listActivePaymentMethods } from "@/server/payment/payment-method.repository";
import type { PublicPaymentMethod } from "@/types/admin-payment-methods";

export async function getActivePaymentMethods(): Promise<PublicPaymentMethod[]> {
  const methods = await listActivePaymentMethods();
  return methods.map((m) => ({
    id: m.id,
    name: m.name,
    type: m.type,
    description: m.description,
    instructions: m.instructions,
    initialOrderStatus: m.initialOrderStatus,
  }));
}
