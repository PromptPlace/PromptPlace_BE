import { WithdrawalRepository } from "../repositories/withdrawal.repository";
import { WithdrawalResponseDto } from "../dtos/withdrawal.dto";

const MIN_WITHDRAWAL = 10_000; // 10,000원

export const WithdrawalService = {
  async requestWithdrawal(userId: number): Promise<WithdrawalResponseDto> {
    // 가용 금액 계산
    const totalEarnings = await WithdrawalRepository.getUserTotalEarnings(userId);
    const totalWithdrawn = await WithdrawalRepository.getUserTotalWithdrawn(userId);
    const available = totalEarnings - totalWithdrawn;

    // 최소 금액 검증
    if (available < MIN_WITHDRAWAL) {
      throw {
        statusCode: 400,
        error: 'InvalidWithdrawalAmount',
        message: '출금 가능 금액은 10,000원 이상이어야 합니다.',
      };
    }

      // 전체 가용 금액으로 출금 요청 생성
    const wr = await WithdrawalRepository.createWithdrawalRequest(userId, available);

    return {
      message: '출금이 완료되었습니다.',
      status: 'Succeed',
      requested_at: wr.created_at.toISOString(),
      statusCode: 200,
    };
  },
};
