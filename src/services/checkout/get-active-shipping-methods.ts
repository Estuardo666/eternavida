import "server-only";

import { listActiveShippingMethods } from "@/server/shipping/shipping-method.repository";
import type { PublicShippingMethod } from "@/types/admin-shipping-methods";

export async function getActiveShippingMethods(): Promise<PublicShippingMethod[]> {
  const methods = await listActiveShippingMethods();
  return methods.map((m) => ({
    id: m.id,
    name: m.name,
    type: m.type,
    price: m.price,
    estimatedDays: m.estimatedDays,
  }));
}
