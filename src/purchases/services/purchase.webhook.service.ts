import { PurchaseRequestRepository } from '../repositories/purchase.request.repository';
import { PurchaseCompleteRepository } from '../repositories/purchase.complete.repository';
import prisma from '../../config/prisma';
import { PayplePaymentResult, verifyPayplePayment } from '../utils/payple';

export const WebhookService = {
  async handlePaypleResult(result: PayplePaymentResult) {
    console.log(`[Webhook] Payple Result Received: ${result.PCD_PAY_OID}`);

    try {
      const verified = await verifyPayplePayment(result, { amount: -1 });

      const promptId = Number(verified.customData?.prompt_id);
      if (!promptId) {
        console.error('[Webhook] Prompt ID missing in PCD_USER_DEFINE1');
        return;
      }

      const userId = Number(verified.customData?.user_id);
      if (!userId) {
        console.error('[Webhook] User ID missing in PCD_USER_DEFINE1');
        return;
      }

      const existing = await PurchaseRequestRepository.findExistingPurchase(userId, promptId);
      if (existing) {
        console.log(`[Webhook] Already processed purchase. PCD_PAY_OID: ${verified.payOid}`);
        return;
      }

      const prompt = await PurchaseRequestRepository.findPromptWithSeller(promptId);
      if (!prompt) throw new Error('Prompt not found');

      const serverPrice = prompt.price;
      if (verified.amount !== serverPrice) {
        console.error('[Webhook] Fraud detected: Amount mismatch');
        return;
      }

      await prisma.$transaction(async (tx) => {
        const purchase = await PurchaseCompleteRepository.createPurchaseTx(tx, {
          user_id: userId,
          prompt_id: prompt.prompt_id,
          amount: serverPrice,
          is_free: false,
        });

        const payment = await PurchaseCompleteRepository.createPaymentTx(tx, {
          purchase_id: purchase.purchase_id,
          pcd_pay_oid: verified.payOid,
          pcd_pay_reqkey: verified.reqKey,
          status: 'Succeed',
          pay_type: verified.payType,
          card_name: verified.cardName,
          cash_receipt_url: verified.cashReceiptUrl,
        });

        const FEE_RATE = 0.1;
        const fee = Math.floor(serverPrice * FEE_RATE);
        await PurchaseCompleteRepository.upsertSettlementForPaymentTx(tx, {
          sellerId: prompt.user_id,
          paymentId: payment.payment_id,
          amount: serverPrice - fee,
          fee,
          status: 'Pending',
        });
      });

      console.log(`[Webhook] Successfully processed payment: ${verified.payOid}`);
    } catch (error) {
      console.error('[Webhook] Processing failed:', error);
      throw error;
    }
  },
};
