import prisma from '../../config/prisma';

const pendingBusinessFilter = {
  seller_type: 'BUSINESS' as const,
  status: 'PENDING' as const,
};

const userInclude = {
  user: {
    select: {
      user_id: true,
      name: true,
      nickname: true,
      email: true,
      profileImage: { select: { url: true } },
    },
  },
};

export const AdminSellerRepository = {
  findPendingBusinessSellers: async (skip: number, take: number) => {
    return prisma.settlementAccount.findMany({
      where: pendingBusinessFilter,
      include: userInclude,
      orderBy: { created_at: 'desc' },
      skip,
      take,
    });
  },

  countPendingBusinessSellers: async () => {
    return prisma.settlementAccount.count({ where: pendingBusinessFilter });
  },

  findPendingBusinessSellerByUserId: async (userId: number) => {
    return prisma.settlementAccount.findFirst({
      where: { ...pendingBusinessFilter, user_id: userId },
      include: userInclude,
    });
  },

  updateBusinessSellerStatus: async (
    userId: number,
    status: 'APPROVED' | 'REJECTED',
  ) => {
    return prisma.settlementAccount.update({
      where: { user_id: userId },
      data: {
        status,
        is_active: status === 'APPROVED',
      },
    });
  },
};
