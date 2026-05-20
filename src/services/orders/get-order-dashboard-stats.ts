import "server-only";

import { orderService } from "@/server/orders/order.service";

export async function getOrderDashboardStats() {
  return orderService.getDashboardStats();
}
