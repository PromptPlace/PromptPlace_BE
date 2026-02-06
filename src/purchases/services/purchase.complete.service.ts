import { PurchaseCompleteRequestDTO, PurchaseCompleteResponseDTO } from '../dtos/purchase.complete.dto';
import { PurchaseRequestRepository } from '../repositories/purchase.request.repository';
import { PurchaseCompleteRepository } from '../repositories/purchase.complete.repository';
import { AppError } from '../../errors/AppError';
import prisma from '../../config/prisma';
import { fetchAndVerifyPortonePayment } from '../utils/portone';

export const PurchaseCompleteService = {
  async completePurchase(userId: number, dto: PurchaseCompleteRequestDTO): Promise<PurchaseCompleteResponseDTO> {
    const { paymentId } = dto; 
    
    // 1. 포트원 조회 (검증 전 단계)
    const verifiedPayment = await fetchAndVerifyPortonePayment(paymentId, { amount: -1 }); 

    const promptId = Number(verifiedPayment.customData?.prompt_id);
    if (!promptId) throw new AppError('결제 정보에 상품 ID가 없습니다.', 400, 'InvalidPaymentData');

    // 2. DB에서 실제 가격 조회
    const prompt = await PurchaseRequestRepository.findPromptWithSeller(promptId);
    if (!prompt) throw new AppError('프롬프트를 찾을 수 없습니다.', 404, 'NotFound');

    // 3. 서버가 알고 있는 가격과 포트원 결제 가격 비교 (이중 검증)
    const serverPrice = prompt.price;
    if (verifiedPayment.amount !== serverPrice) {
        throw new AppError('결제 금액 위변조가 감지되었습니다.', 400, 'FraudDetected');
    }

    // 4. 중복 구매 체크
    const already = await PurchaseRequestRepository.findExistingPurchase(userId, prompt.prompt_id);
    if (already) {
      throw new AppError('이미 구매한 프롬프트입니다.', 409, 'AlreadyPurchased');
    }

    const { purchase_id } = await prisma.$transaction(async (tx) => {
        // 구매 기록 생성
        const purchase = await PurchaseCompleteRepository.createPurchaseTx(tx, {
            user_id: userId,
            prompt_id: prompt.prompt_id,
            seller_id: prompt.user_id,
            amount: serverPrice,
            is_free: false
        });

        // 결제 기록 생성
        const payment = await PurchaseCompleteRepository.createPaymentTx(tx, {
            purchase_id: purchase.purchase_id,
            merchant_uid: paymentId,
            paymentId: paymentId,
            status: 'Succeed',
            method: verifiedPayment.method,     
            provider: verifiedPayment.provider, 
            cash_receipt_url: verifiedPayment.cashReceipt?.url,
            cash_receipt_type: verifiedPayment.cashReceipt?.type,
        });
        
        // 정산 데이터 생성
        const FEE_RATE = 0.1; 
        const fee = Math.floor(serverPrice * FEE_RATE);

        await PurchaseCompleteRepository.upsertSettlementForPaymentTx(tx, {
            sellerId: prompt.user_id,
            paymentId: payment.payment_id, 
            amount: serverPrice - fee, 
            fee: fee,
            status: 'Pending' 
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