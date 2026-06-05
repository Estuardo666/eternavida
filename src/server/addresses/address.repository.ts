import "server-only";
import { prisma } from "@/server/db/prisma";
import { AddressType } from "@prisma/client";
import type { CreateAddressInput, UpdateAddressInput } from "./address.schemas";

export const addressRepository = {
  async getAddressesByUserId(clerkUserId: string) {
    return prisma.address.findMany({
      where: { clerkUserId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  },

  async getAddressesByUserIdAndType(clerkUserId: string, type: AddressType) {
    return prisma.address.findMany({
      where: { clerkUserId, type },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  },

  async getAddressById(id: string, clerkUserId: string) {
    return prisma.address.findFirst({
      where: { id, clerkUserId },
    });
  },

  async createAddress(clerkUserId: string, input: CreateAddressInput) {
    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { clerkUserId, type: input.type, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        clerkUserId,
        type: input.type,
        firstName: input.firstName,
        lastName: input.lastName,
        address: input.address,
        apartment: input.apartment ?? null,
        province: input.province,
        city: input.city,
        phone: input.phone,
        idNumber: input.idNumber ?? null,
        isDefault: input.isDefault ?? false,
      },
    });
  },

  async updateAddress(id: string, clerkUserId: string, input: UpdateAddressInput) {
    const existing = await prisma.address.findFirst({ where: { id, clerkUserId } });
    if (!existing) throw new Error("ADDRESS_NOT_FOUND");

    if (input.isDefault && !existing.isDefault) {
      await prisma.address.updateMany({
        where: { clerkUserId, type: existing.type, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id },
      data: {
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.apartment !== undefined ? { apartment: input.apartment ?? null } : {}),
        ...(input.province !== undefined ? { province: input.province } : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.idNumber !== undefined ? { idNumber: input.idNumber ?? null } : {}),
        ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      },
    });
  },

  async deleteAddress(id: string, clerkUserId: string) {
    const existing = await prisma.address.findFirst({ where: { id, clerkUserId } });
    if (!existing) throw new Error("ADDRESS_NOT_FOUND");

    return prisma.address.delete({ where: { id } });
  },

  async setDefaultAddress(id: string, clerkUserId: string) {
    const existing = await prisma.address.findFirst({ where: { id, clerkUserId } });
    if (!existing) throw new Error("ADDRESS_NOT_FOUND");

    await prisma.address.updateMany({
      where: { clerkUserId, type: existing.type, isDefault: true },
      data: { isDefault: false },
    });

    return prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  },

  async getDefaultAddress(clerkUserId: string, type: AddressType) {
    return prisma.address.findFirst({
      where: { clerkUserId, type, isDefault: true },
    });
  },

  async hasAnyAddresses(clerkUserId: string) {
    const count = await prisma.address.count({ where: { clerkUserId } });
    return count > 0;
  },
};
