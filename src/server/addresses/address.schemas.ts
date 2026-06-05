import { AddressType } from "@prisma/client";
import { z } from "zod";

export const createAddressSchema = z.object({
  type: z.nativeEnum(AddressType),
  firstName: z.string().trim().min(1, "Nombre es requerido"),
  lastName: z.string().trim().min(1, "Apellido es requerido"),
  address: z.string().trim().min(1, "Dirección es requerida"),
  apartment: z.string().trim().optional().nullable(),
  province: z.string().trim().min(1, "Provincia es requerida"),
  city: z.string().trim().min(1, "Ciudad es requerida"),
  phone: z.string().trim().min(1, "Teléfono es requerido"),
  idNumber: z.string().trim().optional().nullable(),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = z.object({
  type: z.nativeEnum(AddressType).optional(),
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  address: z.string().trim().min(1).optional(),
  apartment: z.string().trim().optional().nullable(),
  province: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  idNumber: z.string().trim().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export const addressIdSchema = z.object({
  id: z.string().min(1),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
