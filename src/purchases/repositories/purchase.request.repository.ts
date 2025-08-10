import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

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

   createPurchaseTx(tx: Tx, data: {
    user_id: number;
    prompt_id: number;
    seller_id?: number;
    amount: number;
    is_free: false;
  }) {
    return tx.purchase.create({ data });
  },

  createPaymentTx(tx: Tx, data: {
    purchase_id: number;
    merchant_uid: string;
    pg: 'kakaopay' | 'tosspayments';
    status: 'Succeed' | 'Failed' | 'Pending';
    imp_uid: string;
  }) {
    return tx.payment.create({
      data: {
        purchase: { connect: { purchase_id: data.purchase_id } },
        merchant_uid: data.merchant_uid,
        provider: data.pg,
        status: data.status,
        imp_uid: data.imp_uid,
      },
    });
  },

  upsertSettlementForPaymentTx(tx: Tx, input: {
    sellerId: number;
    paymentId: number;
    amount: number;
    fee: number;
    status: 'Succeed' | 'Failed' | 'Pending';
  }) {
    return tx.settlement.upsert({
      where: { payment_id: input.paymentId },
      create: {
        user_id: input.sellerId,
        payment_id: input.paymentId,
        amount: input.amount,
        fee: input.fee,
        status: input.status,
      },
      update: {
        amount: input.amount,
        fee: input.fee,
        status: input.status,
      },
    });
  },
};