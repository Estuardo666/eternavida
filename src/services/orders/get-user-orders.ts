import "server-only";
import { orderRepository } from "@/server/orders/order.repository";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function getUserOrders(params: { page?: number; pageSize?: number } = {}) {
  const { userId } = await auth();
  if (!userId) return null;

  return orderRepository.getOrdersByUserId(userId, params);
}
