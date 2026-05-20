import "server-only";

import { z } from "zod";

import type { PaymentMethodFormData } from "@/types/admin-payment-methods";

const initialOrderStatusSchema = z.enum(["pending", "confirmed"]);

export const paymentMethodFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120, "Máximo 120 caracteres"),
  description: z.string().trim().max(500, "Máximo 500 caracteres").default(""),
  type: z.string().trim().min(1, "El tipo es obligatorio").max(80, "Máximo 80 caracteres"),
  instructions: z.string().trim().max(2000, "Máximo 2000 caracteres").default(""),
  initialOrderStatus: initialOrderStatusSchema.default("pending"),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int("Debe ser entero").min(0, "Debe ser ≥ 0").default(0),
}) satisfies z.ZodType<PaymentMethodFormData>;

export type NormalizedPaymentMethodInput = PaymentMethodFormData;

export function normalizePaymentMethodInput(
  input: z.infer<typeof paymentMethodFormSchema>,
): NormalizedPaymentMethodInput {
  return {
    name: input.name,
    description: input.description,
    type: input.type.toLowerCase().replace(/\s+/g, "_"),
    instructions: input.instructions,
    initialOrderStatus: input.initialOrderStatus,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
  };
}
