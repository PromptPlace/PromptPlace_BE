import prisma from '../../config/prisma';

export const AdminStatsRepository = {
  countMembersBySocialType: async () => {
    return prisma.user.groupBy({
      by: ['social_type'],
      where: { userstatus: { not: 'deleted' } },
      _count: { _all: true },
    });
  },
};
