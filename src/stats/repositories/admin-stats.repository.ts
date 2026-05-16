import prisma from '../../config/prisma';

export const AdminStatsRepository = {
  countMembersBySocialType: async () => {
    return prisma.user.groupBy({
      by: ['social_type'],
      where: { userstatus: { not: 'deleted' } },
      _count: { _all: true },
    });
  },

  countActiveUsersInRange: async (start: Date, end: Date) => {
    return prisma.user.count({
      where: {
        userstatus: { not: 'deleted' },
        last_active_at: { gte: start, lt: end },
      },
    });
  },
};
