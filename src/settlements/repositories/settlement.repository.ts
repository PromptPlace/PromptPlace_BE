import prisma from "../../config/prisma";

export const SettlementRepository = {
  async findSalesByUserId(userId: number) {
    return prisma.settlement.findMany({
      where: { user_id: userId },
      include: {
        payment: {
          include: {
            purchase: {
              include: {
                prompt: true,
                user: true, // 구매자
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' },
    });
  }
};