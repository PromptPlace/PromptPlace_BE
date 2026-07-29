import { v4 as uuidv4 } from 'uuid';
import { PurchaseRequestDTO, PurchaseRequestResponseDTO } from '../dtos/purchase.request.dto';
import { PurchaseRequestRepository } from '../repositories/purchase.request.repository';
import { AppError } from '../../errors/AppError';
import { requestPaypleAuth } from '../utils/payple';

export const PurchaseRequestService = {
  async createPurchaseRequest(userId: number, dto: PurchaseRequestDTO): Promise<PurchaseRequestResponseDTO> {
    // 환불정책 동의 없이는 주문서 자체를 만들지 않는다 (#533)
    if (dto.refund_policy_agreed !== true) {
      throw new AppError(
        '디지털콘텐츠 특성상 열람(제공 개시) 후에는 단순 변심 환불이 불가합니다. 동의가 필요합니다.',
        400,
        'RefundPolicyNotAgreed',
      );
    }

    const prompt = await PurchaseRequestRepository.findPromptWithSeller(dto.prompt_id);
    if (!prompt) throw new AppError('프롬프트를 찾을 수 없습니다.', 404, 'NotFound');

    if (prompt.is_free) throw new AppError('해당 프롬프트는 무료입니다.', 400, 'BadRequest');

    const existing = await PurchaseRequestRepository.findExistingPurchase(userId, dto.prompt_id);
    if (existing) throw new AppError('이미 구매한 프롬프트입니다.', 409, 'AlreadyPurchased');

    const payType = dto.pay_type === 'transfer' ? 'transfer' : 'card';
    const payOid = `pay-${uuidv4()}`;

    const auth = await requestPaypleAuth(payType, 'PAY');

    return {
      message: '주문서가 생성되었습니다.',
      statusCode: 200,
      PCD_CST_ID: process.env.PAYPLE_PAY_CST_ID || '',
      PCD_CUST_KEY: process.env.PAYPLE_PAY_CUST_KEY || '',
      PCD_AUTH_KEY: auth.authKey,
      PCD_PAY_TYPE: payType,
      PCD_PAY_WORK: 'PAY',
      PCD_PAY_HOST: auth.payHost,
      PCD_PAY_URL: auth.payUrl,
      PCD_PAY_OID: payOid,
      PCD_PAY_GOODS: prompt.title,
      PCD_PAY_TOTAL: prompt.price,
      PCD_USER_DEFINE1: JSON.stringify({
        prompt_id: dto.prompt_id,
        user_id: userId,
        // 동의 시각은 결제 완료 시 Purchase에 기록된다 (#533)
        agreed_at: new Date().toISOString(),
      }),
      PCD_RST_URL: process.env.PAYPLE_RST_URL || '',
    };
  },
};
