import { AppError } from '../../errors/AppError';
import {
  VerifyAccountRequestDto,
  AccountDataDto,
  SellerKind,
  BusinessKind,
} from '../dtos/settlement.dto';
import { SettlementRepository } from '../repositories/settlement.repository';
import {
  AccountVerificationError,
  consumePaypleRateLimit,
  verifyRealNameWithPayple,
} from '../utils/payple';
import { issueRegisterToken } from '../utils/register-token';
import { recordSellerRegistrationConsent } from './seller-consent.service';
import { isValidPaypleBank } from '../constants/bank';

const ALLOWED_SELLER_TYPES: readonly SellerKind[] = ['INDIVIDUAL', 'BUSINESS'];
const ALLOWED_BUSINESS_TYPES: readonly BusinessKind[] = ['PERSONAL', 'CORPORATE'];

const validateDto = (dto: VerifyAccountRequestDto): void => {
  if (!dto || typeof dto !== 'object') {
    throw new AppError('요청 본문이 올바르지 않습니다.', 400, 'ValidationError');
  }
  if (!ALLOWED_SELLER_TYPES.includes(dto.sellerType)) {
    throw new AppError('판매자 유형(sellerType)이 올바르지 않습니다.', 400, 'ValidationError');
  }
  if (!dto.name || !dto.bank || !dto.accountNumber || !dto.holderName) {
    throw new AppError(
      '필수 입력값(이름, 은행, 계좌번호, 예금주명)이 모두 입력되지 않았습니다.',
      400,
      'ValidationError',
    );
  }
  if (dto.sellerType === 'BUSINESS') {
    if (!dto.businessType || !ALLOWED_BUSINESS_TYPES.includes(dto.businessType)) {
      throw new AppError(
        '사업자 유형(businessType)이 올바르지 않습니다. PERSONAL 또는 CORPORATE만 가능합니다.',
        400,
        'ValidationError',
      );
    }
    if (dto.businessType === 'CORPORATE') {
      if (!dto.businessNumber || !/^\d{10}$/.test(dto.businessNumber)) {
        throw new AppError(
          '입력하신 사업자등록번호가 올바르지 않습니다. 10자리 숫자로 다시 입력해 주세요.',
          400,
          'ValidationError',
        );
      }
    } else {
      // PERSONAL — 개인사업자는 생년월일 필수 (Payple type=0)
      if (!dto.birthDate || !/^\d{6}$/.test(dto.birthDate)) {
        throw new AppError(
          '입력하신 생년월일이 올바르지 않습니다. YYMMDD 형식으로 다시 입력해 주세요.',
          400,
          'ValidationError',
        );
      }
    }
  } else {
    // INDIVIDUAL
    if (!dto.birthDate || !/^\d{6}$/.test(dto.birthDate)) {
      throw new AppError(
        '입력하신 생년월일이 올바르지 않습니다. YYMMDD 형식으로 다시 입력해 주세요.',
        400,
        'ValidationError',
      );
    }
  }
  if (!isValidPaypleBank(dto.bank)) {
    throw new AppError(
      '유효하지 않은 계좌번호이거나 지원하지 않는 은행입니다.',
      400,
      'InvalidAccountInfo',
    );
  }

  // 법인사업자가 아닌 경우(INDIVIDUAL, BUSINESS+PERSONAL): name === holderName
  // 법인사업자는 holderName이 법인명이므로 사전 비교 안 함 (Payple 응답으로 검증)
  const isCorporate = dto.sellerType === 'BUSINESS' && dto.businessType === 'CORPORATE';
  if (!isCorporate && dto.name !== dto.holderName) {
    throw new AccountVerificationError(
      '실명/대표자명과 예금주명이 일치하지 않습니다. 다시 확인해주세요.',
      'NAME_MISMATCH',
    );
  }
};

export const verifySellerAccount = async (userId: number, dto: VerifyAccountRequestDto) => {
  validateDto(dto);

  await consumePaypleRateLimit(userId);

  await verifyRealNameWithPayple({
    userId,
    sellerType: dto.sellerType,
    businessType: dto.businessType,
    bank: dto.bank,
    accountNumber: dto.accountNumber,
    holderName: dto.holderName,
    birthDate: dto.birthDate,
    businessNumber: dto.businessNumber,
  });

  // PIPA 증빙: 등록 실패해도 동의 이력은 보존
  await recordSellerRegistrationConsent({ userId });

  const { token, expiresIn } = issueRegisterToken({
    userId,
    sellerType: dto.sellerType,
    businessType: dto.businessType,
    name: dto.name,
    birthDate: dto.birthDate,
    businessNumber: dto.businessNumber,
    bank: dto.bank,
    accountNumber: dto.accountNumber,
    holderName: dto.holderName,
  });

  return {
    message: '계좌 인증이 완료되었습니다.',
    registerToken: token,
    expiresIn,
  };
};

export const getAccountInfo = async (userId: number): Promise<AccountDataDto> => {
  const account = await SettlementRepository.findAccountByUserId(userId);

  if (!account) {
    const error: any = new Error('등록된 계좌 정보가 존재하지 않습니다.');
    error.statusCode = 404;
    error.code = 'AccountNotFound';
    throw error;
  }

  return {
    bank: account.bank_code,
    accountNumber: account.account_number,
    holderName: account.account_holder,
  };
};
