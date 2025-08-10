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
        payment: { is: { status: 'Succeed' } },
      },
    });
  },

  async createPayment(data: {
  purchase_id: number;
  merchant_uid: string;
  pg: 'kakaopay' | 'tosspayments';
  status: 'Succeed' | 'Failed' | 'Pending';
  imp_uid: string;
}) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: { purchase_id: data.purchase_id },
      select: { is_free: true },
    });
    if (!purchase) throw new Error('Purchase not found');
    if (purchase.is_free) throw new Error('무료 구매건에는 Payment를 생성할 수 없습니다.');

    // 중복 Payment 방지(1:1 관계)
    const existing = await tx.payment.findUnique({
      where: { purchase_id: data.purchase_id },
    });
    if (existing) throw new Error('이미 Payment가 존재합니다.');

    // provider(=pg) 유효성 보정
    if (!['kakaopay', 'tosspayments'].includes(data.pg)) {
      throw new Error('지원하지 않는 결제사입니다.');
    }

    return tx.payment.create({
      data: {
        purchase: { connect: { purchase_id: data.purchase_id } },
        merchant_uid: data.merchant_uid,
        provider: data.pg,
        status: data.status,
        imp_uid: data.imp_uid,
      },
    });
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
      },
      update: {
        withdrawable_amount: { increment: amount },
        total_earned: { increment: amount },
      },
    });
  },
};