import "server-only";

import { listShippingMethods } from "@/server/shipping/shipping-method.repository";
import type { ShippingMethodItem } from "@/types/admin-shipping-methods";

export async function getAdminShippingMethods(): Promise<ShippingMethodItem[]> {
  return listShippingMethods();
}
