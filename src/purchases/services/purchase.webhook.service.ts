import { PurchaseRequestRepository } from '../repositories/purchase.request.repository';
import { PurchaseCompleteRepository } from '../repositories/purchase.complete.repository';
import prisma from '../../config/prisma';
import { PayplePaymentResult, parseAgreedAt, verifyPayplePayment } from '../utils/payple';
import { calculateSettlementFee } from '../utils/fee';

export const WebhookService = {
  async handlePaypleResult(result: PayplePaymentResult) {
    console.log(`[Webhook] Payple Result Received: ${result.PCD_PAY_OID}`);

    try {
      if (result.PCD_PAY_OID) {
        const processed = await PurchaseCompleteRepository.findPaymentByOid(result.PCD_PAY_OID);
        if (processed?.status === 'Succeed') return;
      }
      let metadata: { prompt_id?: number; user_id?: number } = {};
      try { metadata = JSON.parse(result.PCD_USER_DEFINE1 ?? '{}'); } catch { /* invalid metadata */ }
      const promptId = Number(metadata.prompt_id);
      if (!Number.isSafeInteger(promptId) || promptId <= 0) {
        console.error('[Webhook] Prompt ID missing in PCD_USER_DEFINE1');
        throw new Error('Prompt ID missing in authentication result');
      }

      const userId = Number(metadata.user_id);
      if (!Number.isSafeInteger(userId) || userId <= 0) {
        console.error('[Webhook] User ID missing in PCD_USER_DEFINE1');
        throw new Error('User ID missing in authentication result');
      }

      const existing = await PurchaseRequestRepository.findExistingPurchase(userId, promptId);
      if (existing) {
        const prior = await PurchaseCompleteRepository.findPaymentByOid(result.PCD_PAY_OID);
        if (prior?.purchase_id === existing.purchase_id && prior.status === 'Succeed') return;
        throw new Error('Prompt already purchased with another payment');
      }

      const prompt = await PurchaseRequestRepository.findPromptWithSeller(promptId);
      if (!prompt) throw new Error('Prompt not found');

      const serverPrice = prompt.price;
      if (Number(result.PCD_PAY_TOTAL) !== serverPrice) {
        console.error('[Webhook] Fraud detected: Amount mismatch');
        throw new Error('Payment amount mismatch');
      }
      const verified = await verifyPayplePayment(result, { amount: serverPrice });

      await prisma.$transaction(async (tx) => {
        const purchase = await PurchaseCompleteRepository.createPurchaseTx(tx, {
          user_id: userId,
          prompt_id: prompt.prompt_id,
          amount: serverPrice,
          is_free: false,
          // 웹훅이 /complete보다 먼저 도착하면 여기서 Purchase가 만들어지므로
          // 동의 시각도 같이 기록해야 유실되지 않는다 (#533)
          refund_policy_agreed_at: parseAgreedAt(verified.customData?.agreed_at),
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

        const { fee, settledAmount } = calculateSettlementFee(serverPrice);
        await PurchaseCompleteRepository.upsertSettlementForPaymentTx(tx, {
          sellerId: prompt.user_id,
          paymentId: payment.payment_id,
          amount: settledAmount,
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
