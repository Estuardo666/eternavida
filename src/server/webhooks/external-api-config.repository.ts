import "server-only";

import { z } from "zod";

import { prisma } from "@/server/db/prisma";

const externalApiConfigSchema = z.object({
  enabled: z.boolean(),
  webhookUrl: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || z.url().safeParse(value).success, {
      message: "Debe ser una URL valida.",
    })
    .optional()
    .transform((value) => {
      if (!value) return null;
      return value;
    }),
  secretToken: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) return null;
      return value;
    }),
  retryAttempts: z.number().int().min(1).max(10).default(3),
  timeoutMs: z.number().int().min(1000).max(60000).default(10000),
});

export type ExternalApiConfigInput = z.infer<typeof externalApiConfigSchema>;

export const externalApiConfigRepository = {
  async getConfig() {
    return prisma.externalApiConfig.upsert({
      where: { id: "default" },
      create: { id: "default" },
      update: {},
    });
  },

  async updateConfig(input: ExternalApiConfigInput) {
    const parsed = externalApiConfigSchema.parse(input);

    return prisma.externalApiConfig.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        ...parsed,
      },
      update: parsed,
    });
  },
};
