import prisma from '../../config/prisma';

export const PurchaseRequestRepository = {
  async findPromptById(promptId: number) {
    return prisma.prompt.findUnique({
      where: { prompt_id: promptId },
    });
  },

  async findExistingPurchase(userId: number, promptId: number) {
    return prisma.purchase.findFirst({
      where: {
        user_id: userId,
        prompt_id: promptId,
        payment: {
          status: 'Succeed',
        },
      },
      include: {
        payment: true,
      },
    });
  },
};