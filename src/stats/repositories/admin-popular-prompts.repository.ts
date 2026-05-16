import prisma from '../../config/prisma';

export const AdminPopularPromptsRepository = {
  findActivePrompts: async () => {
    return prisma.prompt.findMany({
      where: { inactive_date: null },
      select: {
        prompt_id: true,
        title: true,
        views: true,
        downloads: true,
      },
    });
  },

  findSnapshotsByDate: async (snapshotDate: string, promptIds: number[]) => {
    if (promptIds.length === 0) return [];
    return prisma.promptStatDaily.findMany({
      where: {
        snapshot_date: snapshotDate,
        prompt_id: { in: promptIds },
      },
      select: { prompt_id: true, views: true, downloads: true },
    });
  },
};
