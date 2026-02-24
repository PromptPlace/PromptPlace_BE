import prisma from '../../config/prisma';

export const PurchaseRepository = {
  findSucceededByUser(userId: number) {
    return prisma.purchase.findMany({
      where: {
        user_id: userId,
        payment: { is: { status: 'Succeed'}},
      },
      include: {
        prompt: {
          select: {
            prompt_id: true,
            title: true,
            user: { select: { nickname: true}},
          },
        },
      },
      orderBy: { created_at: 'desc'},
    })
  }
};