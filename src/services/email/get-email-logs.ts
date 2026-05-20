import "server-only";
import { emailLogRepository } from "@/server/email/email-log.repository";
import type { EmailStatus } from "@prisma/client";

export async function getEmailLogs(params: {
  page?: number;
  pageSize?: number;
  status?: EmailStatus;
  templateKey?: string;
}) {
  return emailLogRepository.listLogs(params);
}

export async function getEmailStats() {
  return emailLogRepository.getStats();
}
