import { WithdrawalRepository } from "../repositories/withdrawal.repository";
import { WithdrawalAvailableResponseDto } from "../dtos/withdrawal.available.dto";

export const WithdrawalAvailableService = {
  async getAvailableAmount(userId: number): Promise<WithdrawalAvailableResponseDto> {
    const totalEarnings = await WithdrawalRepository.getUserTotalEarnings(userId);
    const totalWithdrawnOrPending = await WithdrawalRepository.getUserTotalWithdrawn(userId);

    const available = Math.max(0, totalEarnings - totalWithdrawnOrPending);

    return {
      message: '출금 가능 금액 조회 성공',
      available_amount: available,
      statusCode: 200,
    };
    }
};