import { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

export const PurchaseCompleteRepository = {
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
    pg: 'kakaopay' | 'tosspay';
    status: 'Succeed' | 'Failed' | 'Pending';
    paymentId: string;
  }) {
    return tx.payment.create({
      data: {
        purchase: { connect: { purchase_id: data.purchase_id } },
        merchant_uid: data.merchant_uid,
        provider: data.pg,
        status: data.status,
        imp_uid: data.paymentId,
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
  }
};