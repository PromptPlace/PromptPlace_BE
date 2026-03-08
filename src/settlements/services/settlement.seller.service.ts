import { RegisterIndividualSellerRequestDto } from '../dtos/settlement.dto';
import { SettlementRepository } from '../repositories/settlement.repository';

export const registerIndividualSeller = async (userId: number, dto: RegisterIndividualSellerRequestDto) => {
  // 1. 필수값 누락 및 약관 동의 여부 검증 (400)
  if (!dto.name || !dto.bank || !dto.accountNumber || !dto.holderName || dto.isTermsAgreed !== true) {
    const error = new Error('필수 입력값이 누락되었거나 이용 약관에 동의하지 않았습니다.');
    error.name = 'ValidationError';
    throw error;
  }

  // 2. 이미 등록된 판매자인지(계좌가 있는지) 검증 (409)
  const existingAccount = await SettlementRepository.findAccountByUserId(userId);
  if (existingAccount) {
    const error = new Error('이미 판매자로 등록된 회원입니다.');
    error.name = 'AlreadyRegistered';
    throw error;
  }

  await SettlementRepository.upsertSettlementAccount(userId, {
    name: dto.name,
    bank: dto.bank,
    accountNumber: dto.accountNumber,
    holderName: dto.holderName,
  });

  return { message: '개인 판매자 등록이 완료되었습니다.' };
};
