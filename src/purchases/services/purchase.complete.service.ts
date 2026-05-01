import { PurchaseCompleteRequestDTO, PurchaseCompleteResponseDTO } from '../dtos/purchase.complete.dto';
import { PurchaseRequestRepository } from '../repositories/purchase.request.repository';
import { PurchaseCompleteRepository } from '../repositories/purchase.complete.repository';
import { AppError } from '../../errors/AppError';
import prisma from '../../config/prisma';
import { verifyPayplePayment } from '../utils/payple';

export const PurchaseCompleteService = {
  async completePurchase(userId: number, dto: PurchaseCompleteRequestDTO): Promise<PurchaseCompleteResponseDTO> {
    const verifiedPayment = await verifyPayplePayment(dto, { amount: -1 });

    const promptId = Number(verifiedPayment.customData?.prompt_id);
    if (!promptId) throw new AppError('결제 정보에 상품 ID가 없습니다.', 400, 'InvalidPaymentData');

    const prompt = await PurchaseRequestRepository.findPromptWithSeller(promptId);
    if (!prompt) throw new AppError('프롬프트를 찾을 수 없습니다.', 404, 'NotFound');

    const serverPrice = prompt.price;
    if (verifiedPayment.amount !== serverPrice) {
      throw new AppError('결제 금액 위변조가 감지되었습니다.', 400, 'FraudDetected');
    }

    const already = await PurchaseRequestRepository.findExistingPurchase(userId, prompt.prompt_id);
    if (already) {
      throw new AppError('이미 구매한 프롬프트입니다.', 409, 'AlreadyPurchased');
    }

    const { purchase_id } = await prisma.$transaction(async (tx) => {
      const purchase = await PurchaseCompleteRepository.createPurchaseTx(tx, {
        user_id: userId,
        prompt_id: prompt.prompt_id,
        amount: serverPrice,
        is_free: false,
      });

      const payment = await PurchaseCompleteRepository.createPaymentTx(tx, {
        purchase_id: purchase.purchase_id,
        pcd_pay_oid: verifiedPayment.payOid,
        pcd_pay_reqkey: verifiedPayment.reqKey,
        status: 'Succeed',
        pay_type: verifiedPayment.payType,
        card_name: verifiedPayment.cardName,
        cash_receipt_url: verifiedPayment.cashReceiptUrl,
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

      return { purchase_id: purchase.purchase_id };
    });

    return {
      message: '결제 성공',
      status: 'Succeed',
      purchase_id,
      statusCode: 200,
    };
  },
};
