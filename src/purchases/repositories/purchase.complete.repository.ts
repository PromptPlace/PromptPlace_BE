import { Prisma, Status } from '@prisma/client';

type Tx = Prisma.TransactionClient;

export const PurchaseCompleteRepository = {
  createPurchaseTx(tx: Tx, data: {
    user_id: number;
    prompt_id: number;
    amount: number;
    is_free: false;
  }) {
    return tx.purchase.create({ data });
  },

  createPaymentTx(tx: Tx, data: {
    purchase_id: number;
    pcd_pay_oid: string;
    pcd_pay_reqkey: string;
    status: Status;
    pay_type?: string | null;
    card_name?: string | null;
    cash_receipt_url?: string | null;
  }) {
    return tx.payment.create({
      data: {
        purchase: { connect: { purchase_id: data.purchase_id } },
        pcd_pay_oid: data.pcd_pay_oid,
        pcd_pay_reqkey: data.pcd_pay_reqkey,
        status: data.status,
        pay_type: data.pay_type,
        card_name: data.card_name,
        cash_receipt_url: data.cash_receipt_url,
      },
    });
  },

  upsertSettlementForPaymentTx(tx: Tx, input: {
    sellerId: number;
    paymentId: number;
    amount: number;
    fee: number;
    status: Status;
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
