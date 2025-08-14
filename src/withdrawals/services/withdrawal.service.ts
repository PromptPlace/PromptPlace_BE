import { WithdrawalRepository } from "../repositories/withdrawal.repository";
import { WithdrawalRequestDto, WithdrawalResponseDto } from "../dtos/withdrawal.dto";

export const WithdrawalService = {
  async requestWithdrawal(userId: number, dto: WithdrawalRequestDto): Promise<WithdrawalResponseDto> {
    const { amount } = dto;

    // 1. 최소 출금 금액 확인
    if (amount < 10000) {
      throw {
        statusCode: 400,
        error: 'InvalidWithdrawalAmount',
        message: '출금 가능 금액은 1,000원 이상이어야 합니다.',
      };
    }

    // 2. 보유 정산금 계산
    const totalEarnings = await WithdrawalRepository.getUserTotalEarnings(userId);
    const totalWithdrawn = await WithdrawalRepository.getUserTotalWithdrawn(userId);
    const available = totalEarnings - totalWithdrawn;

    // 3. 잔액 부족 여부 확인
    if (amount > available) {
      throw {
        statusCode: 400,
        error: 'InsufficientBalance',
        message: '출금 요청 금액이 잔액을 초과합니다.',
      };
    }

    // 4. 출금 요청 생성
    const withdrawRequest = await WithdrawalRepository.createWithdrawalRequest(userId, amount);

    return {
      message: '출금이 완료되었습니다.',
      status: 'Succeed',
      requested_at: withdrawRequest.created_at.toISOString(),
      statusCode: 200,
    };
  },
};
