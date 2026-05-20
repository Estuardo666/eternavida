import "server-only";
import { prisma } from "@/server/db/prisma";
import { EmailStatus, type Prisma } from "@prisma/client";

export const emailLogRepository = {
  async createLog(data: {
    recipient: string;
    templateKey: string;
    subject: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.emailLog.create({
      data: {
        recipient: data.recipient,
        templateKey: data.templateKey,
        subject: data.subject,
        ...(data.metadata ? { metadata: data.metadata } : {}),
        status: "queued",
      },
    });
  },

  async updateLogStatus(
    id: string,
    status: EmailStatus,
    opts?: { resendId?: string; error?: string },
  ) {
    return prisma.emailLog.update({
      where: { id },
      data: {
        status,
        ...(opts?.resendId ? { resendId: opts.resendId } : {}),
        ...(opts?.error ? { errorMessage: opts.error } : {}),
      },
    });
  },

  async listLogs(params: {
    page?: number;
    pageSize?: number;
    status?: EmailStatus;
    templateKey?: string;
    from?: Date;
    to?: Date;
  }) {
    const { page = 1, pageSize = 50, status, templateKey, from, to } = params;
    const where = {
      ...(status && { status }),
      ...(templateKey && { templateKey }),
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: from }),
              ...(to && { lte: to }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.emailLog.count({ where }),
    ]);

    return { items, total, page, pageSize };
  },

  async getStats() {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const rows = await prisma.emailLog.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { createdAt: { gte: since } },
    });

    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count.status;
      return acc;
    }, {});
  },
};
