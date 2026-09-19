import { PurchaseCompleteRequestDTO, PurchaseCompleteResponseDTO } from '../dtos/purchase.complete.dto';
import { PurchaseRequestRepository } from '../repositories/purchase.request.repository';
import { PurchaseCompleteRepository } from '../repositories/purchase.complete.repository';
import { AppError } from '../../errors/AppError';
import prisma from '../../config/prisma';
import { parseAgreedAt, verifyPayplePayment } from '../utils/payple';
import { calculateSettlementFee } from '../utils/fee';

export const PurchaseCompleteService = {
  async completePurchase(userId: number, dto: PurchaseCompleteRequestDTO): Promise<PurchaseCompleteResponseDTO> {
    // 다른 사용자의 인증 결과로 승인 요청을 보내지 않는다.
    let callbackUserId: number | undefined;
    let callbackPromptId: number | undefined;
    try {
      const metadata = JSON.parse(dto.PCD_USER_DEFINE1 ?? '{}');
      callbackUserId = Number(metadata.user_id);
      callbackPromptId = Number(metadata.prompt_id);
    } catch { /* invalid metadata */ }
    if (callbackUserId !== userId) {
      throw new AppError('결제 요청 사용자와 로그인 사용자가 다릅니다.', 403, 'Forbidden');
    }

    const processed = await PurchaseCompleteRepository.findPaymentByOid(dto.PCD_PAY_OID);
    if (processed?.status === 'Succeed' && processed.purchase.user_id === userId) {
      return { message: '결제 성공', status: 'Succeed', purchase_id: processed.purchase_id, statusCode: 200 };
    }

    if (!Number.isSafeInteger(callbackPromptId) || !callbackPromptId || callbackPromptId <= 0) {
      throw new AppError('결제 정보에 상품 ID가 없습니다.', 400, 'InvalidPaymentData');
    }
    const prompt = await PurchaseRequestRepository.findPromptWithSeller(callbackPromptId);
    if (!prompt) throw new AppError('프롬프트를 찾을 수 없습니다.', 404, 'NotFound');
    const serverPrice = prompt.price;
    if (Number(dto.PCD_PAY_TOTAL) !== serverPrice) {
      throw new AppError('결제 금액 위변조가 감지되었습니다.', 400, 'FraudDetected');
    }
    if (await PurchaseRequestRepository.findExistingPurchase(userId, prompt.prompt_id)) {
      throw new AppError('이미 구매한 프롬프트입니다.', 409, 'AlreadyPurchased');
    }

    const verifiedPayment = await verifyPayplePayment(dto, { amount: serverPrice });

    if (Number(verifiedPayment.customData.user_id) !== userId) {
      throw new AppError('결제 승인 사용자와 로그인 사용자가 다릅니다.', 403, 'Forbidden');
    }

    const already = await PurchaseRequestRepository.findExistingPurchase(userId, prompt.prompt_id);
    if (already) {
      const prior = await PurchaseCompleteRepository.findPaymentByOid(verifiedPayment.payOid);
      if (prior?.status === 'Succeed' && prior.purchase_id === already.purchase_id) {
        return { message: '결제 성공', status: 'Succeed', purchase_id: prior.purchase_id, statusCode: 200 };
      }
      throw new AppError('이미 구매한 프롬프트입니다.', 409, 'AlreadyPurchased');
    }

    const { purchase_id } = await prisma.$transaction(async (tx) => {
      const purchase = await PurchaseCompleteRepository.createPurchaseTx(tx, {
        user_id: userId,
        prompt_id: prompt.prompt_id,
        amount: serverPrice,
        is_free: false,
        // 주문서 생성 시 검증된 환불정책 동의 시각 (#533)
        refund_policy_agreed_at: parseAgreedAt(verifiedPayment.customData?.agreed_at),
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

      const { fee, settledAmount } = calculateSettlementFee(serverPrice);

      await PurchaseCompleteRepository.upsertSettlementForPaymentTx(tx, {
        sellerId: prompt.user_id,
        paymentId: payment.payment_id,
        amount: settledAmount,
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
