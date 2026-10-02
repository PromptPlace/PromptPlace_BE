import prisma from '../../config/prisma';

export const PurchaseResultRepository = {
  findByOrderIdAndUser(orderId: string, userId: number) {
    return prisma.payment.findFirst({
      where: {
        pcd_pay_oid: orderId,
        purchase: { user_id: userId },
      },
      select: {
        pcd_pay_oid: true,
        status: true,
        created_at: true,
        purchase: {
          select: {
            purchase_id: true,
            prompt_id: true,
            amount: true,
          },
        },
      },
    });
  },
};
