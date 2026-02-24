import { PurchaseRequestRepository } from '../repositories/purchase.request.repository';
import { PurchaseCompleteRepository } from '../repositories/purchase.complete.repository';
import prisma from '../../config/prisma';
import { fetchAndVerifyPortonePayment } from '../utils/portone';

export const WebhookService = {
  async handleTransactionPaid(paymentId: string, storeId: string) {
    console.log(`[Webhook] Payment Paid Event Received: ${paymentId}`);

    // 1. 이미 처리된 결제인지 확인
    try {
      // 2. 포트원 결제 내역 조회
      const verifiedPayment = await fetchAndVerifyPortonePayment(paymentId, { amount: -1 });

      const promptId = Number(verifiedPayment.customData?.prompt_id);
      if (!promptId) {
        console.error('[Webhook] Prompt ID missing in customData');
        return; // 데이터 오류이므로 종료 (재시도 방지 위해 200 리턴 대상)
      }

      const userId = Number(verifiedPayment.customData?.user_id); 
    
      // 3. 중복 구매 체크
      if (userId) {
        const existing = await PurchaseRequestRepository.findExistingPurchase(userId, promptId);
        if (existing) {
          console.log(`[Webhook] Already processed purchase. PaymentId: ${paymentId}`);
          return; 
        }
      }

      // 4. 가격 검증
      const prompt = await PurchaseRequestRepository.findPromptWithSeller(promptId);
      if (!prompt) throw new Error('Prompt not found');

      const serverPrice = prompt.price;

      if (verifiedPayment.amount !== serverPrice) {
        console.error('[Webhook] Fraud detected: Amount mismatch');
        return; 
      }

      // 5. 트랜잭션 처리 
      if (!userId) {
         console.error('[Webhook] User ID not found in custom_data. Cannot process.');
         return;
      }

      await prisma.$transaction(async (tx) => {
        // 구매 생성
        const purchase = await PurchaseCompleteRepository.createPurchaseTx(tx, {
          user_id: userId,
          prompt_id: prompt.prompt_id,
          seller_id: prompt.user_id,
          amount: serverPrice,
          is_free: false
        });

        // 결제 생성
        const payment = await PurchaseCompleteRepository.createPaymentTx(tx, {
          purchase_id: purchase.purchase_id,
          merchant_uid: paymentId,
          method: verifiedPayment.method,     
          cash_receipt_url: verifiedPayment.cashReceipt?.url,
          cash_receipt_type: verifiedPayment.cashReceipt?.type,
          status: 'Succeed',
          paymentId: paymentId
        });

        // 정산 생성
        const FEE_RATE = 0.1;
        const fee = Math.floor(serverPrice * FEE_RATE);
        await PurchaseCompleteRepository.upsertSettlementForPaymentTx(tx, {
          sellerId: prompt.user_id,
          paymentId: payment.payment_id, 
          amount: serverPrice - fee,
          fee: fee,
          status: 'Pending'
        });
      });
      console.log(`[Webhook] Successfully processed payment: ${paymentId}`);
    } catch (error) {
      console.error('[Webhook] Processing failed:', error);
      throw error; 
    }
  }
};