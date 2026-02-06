import { v4 as uuidv4 } from 'uuid';
import { PromptPurchaseRequestDTO } from '../dtos/purchase.request.dto';
import { PurchaseRequestRepository } from '../repositories/purchase.request.repository';
import { AppError } from '../../errors/AppError';

export const PurchaseRequestService = {
  async createPurchaseRequest(userId: number, dto: PromptPurchaseRequestDTO) {
    const prompt = await PurchaseRequestRepository.findPromptWithSeller(dto.prompt_id);
    if (!prompt) throw new AppError('프롬프트를 찾을 수 없습니다.', 404, 'NotFound');

    if (prompt.is_free) throw new AppError('해당 프롬프트는 무료입니다.', 400, 'BadRequest');

    const existing = await PurchaseRequestRepository.findExistingPurchase(userId, dto.prompt_id);
    if (existing) throw new AppError('이미 구매한 프롬프트입니다.', 409, 'AlreadyPurchased');

    const paymentId = `payment-${uuidv4()}`;

    return {
      message: '주문서가 생성되었습니다.',
      statusCode: 200,
      merchant_uid: paymentId,
      amount: prompt.price,
      prompt_title: prompt.title,
      custom_data: {
        prompt_id: dto.prompt_id, 
        user_id: userId,
      },
    };
  },
};