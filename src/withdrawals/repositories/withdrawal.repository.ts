import prisma from "../../config/prisma";

export const WithdrawalRepository = {
  async getUserTotalEarnings(userId: number): Promise<number> {
    const result = await prisma.settlement.aggregate({
      where: { user_id: userId },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  },

  async getUserTotalWithdrawn(userId: number): Promise<number> {
    const result = await prisma.withdrawRequest.aggregate({
      where: { user_id: userId },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  },

  async createWithdrawalRequest(userId: number, amount: number) {
    return prisma.withdrawRequest.create({
      data: {
        user_id: userId,
        amount,
        status: 'Succeed', 
      },
    });
  },
};