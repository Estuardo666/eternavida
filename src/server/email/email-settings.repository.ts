import "server-only";
import { env } from "@/config/env";
import { prisma } from "@/server/db/prisma";
import { z } from "zod";

export const emailSettingsSchema = z.object({
  adminEmails: z.array(z.email()).min(1),
  testMode: z.boolean(),
  testEmails: z.array(z.email()),
  fromName: z.string().min(1),
  fromEmail: z.string().email(),
  replyTo: z.string().email().optional().or(z.literal("")),
});

export type EmailSettingsInput = z.infer<typeof emailSettingsSchema>;

export const emailSettingsRepository = {
  async getSettings() {
    return prisma.emailSettings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        adminEmails: [],
        testMode: true,
        testEmails: [],
        fromName: env.EMAIL_FROM_NAME ?? "Dermatologika",
        fromEmail: env.EMAIL_FROM_ADDRESS ?? "onboarding@resend.dev",
        replyTo: env.EMAIL_REPLY_TO ?? null,
      },
    });
  },

  async updateSettings(input: EmailSettingsInput) {
    const validated = emailSettingsSchema.parse(input);
    return prisma.emailSettings.upsert({
      where: { id: "default" },
      update: {
        ...validated,
        replyTo: validated.replyTo || null,
      },
      create: {
        id: "default",
        ...validated,
        replyTo: validated.replyTo || null,
      },
    });
  },
};
