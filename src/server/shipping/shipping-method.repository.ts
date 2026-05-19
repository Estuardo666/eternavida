import "server-only";

import { prisma } from "@/server/db/prisma";
import type { ShippingMethodItem } from "@/types/admin-shipping-methods";
import type { NormalizedShippingMethodInput } from "@/server/shipping/shipping-method.schemas";

interface DecimalLike { toNumber(): number }

function mapShippingMethod(record: {
  id: string;
  name: string;
  description: string | null;
  type: string;
  price: DecimalLike;
  estimatedDays: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): ShippingMethodItem {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    type: record.type,
    price: record.price.toNumber(),
    estimatedDays: record.estimatedDays,
    isActive: record.isActive,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listShippingMethods(): Promise<ShippingMethodItem[]> {
  const records = await prisma.shippingMethod.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return records.map(mapShippingMethod);
}

export async function listActiveShippingMethods(): Promise<ShippingMethodItem[]> {
  const records = await prisma.shippingMethod.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return records.map(mapShippingMethod);
}

export async function createShippingMethod(data: NormalizedShippingMethodInput): Promise<ShippingMethodItem> {
  const record = await prisma.shippingMethod.create({ data });
  return mapShippingMethod(record);
}

export async function updateShippingMethod(
  id: string,
  data: Partial<NormalizedShippingMethodInput>,
): Promise<ShippingMethodItem> {
  const record = await prisma.shippingMethod.update({ where: { id }, data });
  return mapShippingMethod(record);
}

export async function deleteShippingMethod(id: string): Promise<void> {
  await prisma.shippingMethod.delete({ where: { id } });
}
