import { PromptPurchaseCompleteRequestDTO, PromptPurchaseCompleteResponseDTO } from '../dtos/purchase.complete.dto';
import { PurchaseRepository } from '../repositories/purchase.request.repository';
import { AppError } from '../../errors/AppError';
import axios from 'axios';

export const PurchaseCompleteService = {
  async completePurchase(userId: number, dto: PromptPurchaseCompleteRequestDTO): Promise<PromptPurchaseCompleteResponseDTO> {
    const { imp_uid, merchant_uid } = dto;

    // 1. PortOne에서 결제 검증
    const portOneRes = await axios.get(`https://api.iamport.kr/payments/${imp_uid}`, {
      headers: { Authorization: `Bearer ${process.env.PORTONE_ACCESS_TOKEN}` },
    });

    const paymentData = portOneRes.data.response;
    if (!paymentData || paymentData.status !== 'paid') {
      throw new AppError('결제가 정상적으로 완료되지 않았습니다.', 400, 'BadRequest');
    }

    const { amount, pg_provider, paid_at, custom_data, name } = paymentData;

    // 2. 프롬프트 + 판매자 조회
    const prompt = await PurchaseRepository.findPromptWithSeller(custom_data.prompt_id);
    if (!prompt) throw new AppError('프롬프트를 찾을 수 없습니다.', 404, 'NotFound');

    const seller_id = prompt.user_id;

    // 3. 결제 정보 저장
    const payment = await PurchaseRepository.createPayment({
      merchant_uid,
      pg: pg_provider,
      status: 'Succeed',
      paid_at: new Date(paid_at),
      raw_data: paymentData,
    });

    // 4. 구매 기록 생성
    const purchase = await PurchaseRepository.createPurchase({
      user_id: userId,
      prompt_id: prompt.prompt_id,
      seller_id,
      payment_id: payment.payment_id,
      amount,
    });

    // 5. 판매자 정산 금액 반영
    await PurchaseRepository.updateSellerSettlement(seller_id, amount);

    return {
      message: '결제가 성공적으로 완료되었습니다.',
      status: 'Succeed',
      purchase_id: purchase.purchase_id,
      statusCode: 200,
    };
  },
};