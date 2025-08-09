import prisma from '../../config/prisma';

export const PurchaseRepository = {
  findPromptWithSeller(prompt_id: number) {
    return prisma.prompt.findUnique({
      where: { prompt_id },
      include: { user: true }, // 판매자 user
    });
  },

  findExistingPurchase(userId: number, promptId: number) {
    return prisma.purchase.findFirst({
      where: {
        user_id: userId,
        prompt_id: promptId,
        payment: { status: 'Succeed' },
      },
    });
  },

  async createPayment(data: {
  purchase_id: number;
  merchant_uid: string;
  pg: string;
  status: 'Succeed' | 'Failed' | 'Pending';
  iamport_uid: string;
}) {
  return prisma.payment.create({
    data: {
      purchase: {
         connect: { purchase_id: data.purchase_id },
       },
      merchant_uid: data.merchant_uid,
      provider: data.pg,
      status: data.status,
      iamport_uid: data.iamport_uid,
    },
  });
},

  createPurchase(data: {
    user_id: number;
    prompt_id: number;
    seller_id: number;
    amount: number;
    is_free: false;
  }) {
    return prisma.purchase.create({ data });
  },

  updateSellerSettlement(seller_id: number, amount: number) {
    return prisma.settlement.upsert({
      where: { user_id: seller_id },
      create: {
        user_id: seller_id,
        withdrawable_amount: amount,
        total_earned: amount,
      },
      update: {
        withdrawable_amount: { increment: amount },
        total_earned: { increment: amount },
      },
    });
  },
};