import "server-only";

import { prisma } from "@/server/db/prisma";
import type { PaymentMethodItem } from "@/types/admin-payment-methods";
import type { NormalizedPaymentMethodInput } from "@/server/payment/payment-method.schemas";

function mapPaymentMethod(record: {
  id: string;
  name: string;
  description: string | null;
  type: string;
  instructions: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): PaymentMethodItem {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    type: record.type,
    instructions: record.instructions,
    isActive: record.isActive,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listPaymentMethods(): Promise<PaymentMethodItem[]> {
  const records = await prisma.paymentMethod.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return records.map(mapPaymentMethod);
}

export async function listActivePaymentMethods(): Promise<PaymentMethodItem[]> {
  const records = await prisma.paymentMethod.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return records.map(mapPaymentMethod);
}

export async function createPaymentMethod(data: NormalizedPaymentMethodInput): Promise<PaymentMethodItem> {
  const record = await prisma.paymentMethod.create({ data });
  return mapPaymentMethod(record);
}

export async function updatePaymentMethod(
  id: string,
  data: Partial<NormalizedPaymentMethodInput>,
): Promise<PaymentMethodItem> {
  const record = await prisma.paymentMethod.update({ where: { id }, data });
  return mapPaymentMethod(record);
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await prisma.paymentMethod.delete({ where: { id } });
}
