import prisma from '../../config/prisma';

export const PurchaseRepository = {
  // 결제내역: 결제 성공(Succeed) + 환불(Refunded) 거래 포함.
  // 환불된 거래도 사용자가 결제내역에서 식별할 수 있어야 함 (#497).
  findPurchaseHistory(userId: number) {
    return prisma.purchase.findMany({
      where: {
        user_id: userId,
        payment: { is: { status: { in: ['Succeed', 'Refunded'] } } },
      },
      include: {
        prompt: {
          select: {
            prompt_id: true,
            title: true,
            user: { select: { nickname: true } },
          },
        },
        payment: { select: { status: true } },
        refund: { select: { refunded_at: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  },
};
