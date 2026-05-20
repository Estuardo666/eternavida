import "server-only";
import { orderRepository, type OrderQueryParams } from "@/server/orders/order.repository";

export async function getAdminOrders(params: OrderQueryParams = {}) {
  return orderRepository.getAllOrders(params);
}
