import { PromptPurchaseRequestDTO } from '../dtos/purchase.request.dto';
import { PurchaseRepository } from '../repositories/purchase.request.repository';
import { AppError } from '../../errors/AppError';

export const PurchaseRequestService = {
  async createPurchaseRequest(userId: number, dto: PromptPurchaseRequestDTO) {
    const prompt = await PurchaseRepository.findPromptWithSeller(dto.prompt_id);
    if (!prompt) throw new AppError('프롬프트를 찾을 수 없습니다.', 404, 'NotFound');

    if (prompt.is_free) throw new AppError('해당 프롬프트는 무료입니다.', 400, 'BadRequest');

    const existing = await PurchaseRepository.findExistingPurchase(userId, dto.prompt_id);
    if (existing) throw new AppError('이미 구매한 프롬프트입니다.', 409, 'AlreadyPurchased');

    return {
      message: '결제 요청이 정상 처리되었습니다.',
      payment_gateway: dto.pg,
      merchant_uid: dto.merchant_uid,
      redirect_url: dto.redirect_url, // 클라이언트가 넘긴 값 사용
      statusCode: 200,
    };
  },
};