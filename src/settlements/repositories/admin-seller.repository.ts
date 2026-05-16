import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';

const pendingBusinessFilter = {
  seller_type: 'BUSINESS' as const,
  status: 'PENDING' as const,
};

const buildSearchFilter = (search?: string): Prisma.UserWhereInput | undefined => {
  if (!search) return undefined;
  return {
    OR: [
      { name: { contains: search } },
      { email: { contains: search } },
      { nickname: { contains: search } },
    ],
  };
};

const buildApprovedSellerWhere = (
  sellerType: 'INDIVIDUAL' | 'BUSINESS',
  search?: string,
): Prisma.SettlementAccountWhereInput => {
  const userFilter = buildSearchFilter(search);
  return {
    seller_type: sellerType,
    status: 'APPROVED',
    ...(userFilter ? { user: userFilter } : {}),
  };
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

  findApprovedSellers: async (
    sellerType: 'INDIVIDUAL' | 'BUSINESS',
    skip: number,
    take: number,
    search?: string,
  ) => {
    return prisma.settlementAccount.findMany({
      where: buildApprovedSellerWhere(sellerType, search),
      include: userInclude,
      orderBy: { created_at: 'desc' },
      skip,
      take,
    });
  },

  countApprovedSellers: async (
    sellerType: 'INDIVIDUAL' | 'BUSINESS',
    search?: string,
  ) => {
    return prisma.settlementAccount.count({
      where: buildApprovedSellerWhere(sellerType, search),
    });
  },

  findApprovedSellerByUserId: async (
    sellerType: 'INDIVIDUAL' | 'BUSINESS',
    userId: number,
  ) => {
    return prisma.settlementAccount.findFirst({
      where: {
        seller_type: sellerType,
        status: 'APPROVED',
        user_id: userId,
      },
      include: userInclude,
    });
  },

  findApprovedSellerAnyType: async (userId: number) => {
    return prisma.settlementAccount.findFirst({
      where: { user_id: userId, status: 'APPROVED' },
    });
  },

  cancelSellerTransaction: async (userId: number) => {
    const [deactivatedPrompts] = await prisma.$transaction([
      prisma.prompt.updateMany({
        where: { user_id: userId, inactive_date: null },
        data: { inactive_date: new Date() },
      }),
      prisma.settlementAccount.delete({
        where: { user_id: userId },
      }),
    ]);
    return { deactivated_prompt_count: deactivatedPrompts.count };
  },
};
