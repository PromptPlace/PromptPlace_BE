import prisma from '../../config/prisma';

export const AdminPromptStatsRepository = {
  findActivePromptCreatedAtsSince: async (since: Date) => {
    return prisma.prompt.findMany({
      where: { created_at: { gte: since }, inactive_date: null },
      select: { created_at: true },
    });
  },

  groupPaidPurchaseAmountSince: async (since: Date, take: number) => {
    return prisma.purchase.groupBy({
      by: ['prompt_id'],
      where: { created_at: { gte: since }, is_free: false },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take,
    });
  },

  findPromptTitlesByIds: async (promptIds: number[]) => {
    if (promptIds.length === 0) return [];
    return prisma.prompt.findMany({
      where: { prompt_id: { in: promptIds } },
      select: { prompt_id: true, title: true },
    });
  },
};
