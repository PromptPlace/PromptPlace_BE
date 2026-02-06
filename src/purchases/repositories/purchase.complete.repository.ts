import { Prisma, PaymentMethod, PaymentProvider, Status } from '@prisma/client';

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
    method: PaymentMethod;      
    provider: PaymentProvider;       
    status: Status; 
    paymentId: string;
    cash_receipt_url?: string | null;
    cash_receipt_type?: string | null;
  }) {
    return tx.payment.create({
      data: {
        purchase: { connect: { purchase_id: data.purchase_id } },
        merchant_uid: data.merchant_uid,
        imp_uid: data.paymentId,
        method: data.method,
        provider: data.provider,
        status: data.status,
        cash_receipt_url: data.cash_receipt_url,
        cash_receipt_type: data.cash_receipt_type,
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
  }
};