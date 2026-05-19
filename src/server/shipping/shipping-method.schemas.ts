import "server-only";

import { z } from "zod";

import type { ShippingMethodFormData } from "@/types/admin-shipping-methods";

export const shippingMethodFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120, "Máximo 120 caracteres"),
  description: z.string().trim().max(500, "Máximo 500 caracteres").default(""),
  type: z.string().trim().min(1, "El tipo es obligatorio").max(80, "Máximo 80 caracteres"),
  price: z
    .coerce
    .number()
    .finite("El precio debe ser un número válido")
    .min(0, "El precio no puede ser negativo")
    .refine((v) => Number.isInteger(v * 100), "El precio admite hasta 2 decimales"),
  estimatedDays: z.string().trim().max(100, "Máximo 100 caracteres").default(""),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int("Debe ser entero").min(0, "Debe ser ≥ 0").default(0),
}) satisfies z.ZodType<ShippingMethodFormData>;

export type NormalizedShippingMethodInput = ShippingMethodFormData;

export function normalizeShippingMethodInput(
  input: z.infer<typeof shippingMethodFormSchema>,
): NormalizedShippingMethodInput {
  return {
    name: input.name,
    description: input.description,
    type: input.type.toLowerCase().replace(/\s+/g, "_"),
    price: input.price,
    estimatedDays: input.estimatedDays,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
  };
}
