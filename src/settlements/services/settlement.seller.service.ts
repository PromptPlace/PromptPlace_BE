import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../errors/AppError';
import {
  RegisterIndividualSellerRequestDto,
  RegisterBusinessSellerRequestDto,
} from '../dtos/settlement.dto';
import { SettlementRepository } from '../repositories/settlement.repository';
import { consumeRegisterToken } from '../utils/register-token';
import { uploadFileToS3 } from '../utils/s3-client';
import { detectBusinessLicenseFileType, isClaimedMimeMatch } from '../utils/file-signature';

export const uploadBusinessLicenseFile = async (
  file: Express.Multer.File,
) => {
  const detected = detectBusinessLicenseFileType(file.buffer);
  if (!detected) {
    throw new AppError(
      '지원하지 않는 파일 형식입니다. (jpg, jpeg, png, pdf만 가능)',
      415,
      'InvalidFileType',
    );
  }
  if (!isClaimedMimeMatch(file.mimetype, detected)) {
    throw new AppError(
      '업로드된 파일의 실제 형식과 확장자가 일치하지 않습니다.',
      415,
      'InvalidFileType',
    );
  }

  try {
    // userId 노출/예측 가능성 차단을 위해 uuid 사용
    const fileKey = `business-licenses/${uuidv4()}${detected.ext}`;
    const fileUrl = await uploadFileToS3(fileKey, file.buffer, detected.mime);

    return {
      message: '사업자등록증 업로드가 완료되었습니다.',
      fileKey,
      fileUrl,
    };
  } catch (error) {
    console.error('S3 업로드 에러');
    throw new AppError('파일 업로드 중 서버 오류가 발생했습니다.', 500, 'InternalServerError');
  }
};

export const registerIndividualSeller = async (
  userId: number,
  dto: RegisterIndividualSellerRequestDto,
) => {
  if (!dto || !dto.registerToken || dto.isTermsAgreed !== true) {
    const error = new Error('필수 입력값이 누락되었거나 이용 약관에 동의하지 않았습니다.');
    error.name = 'ValidationError';
    throw error;
  }

  const payload = await consumeRegisterToken(dto.registerToken);

  if (payload.userId !== userId) {
    const error = new Error('등록 토큰의 사용자 정보가 요청과 일치하지 않습니다.');
    error.name = 'ValidationError';
    throw error;
  }
  if (payload.sellerType !== 'INDIVIDUAL') {
    const error = new Error('등록 토큰의 판매자 유형이 일치하지 않습니다.');
    error.name = 'ValidationError';
    throw error;
  }

  const existingAccount = await SettlementRepository.findAccountByUserId(userId);
  if (existingAccount && existingAccount.seller_type === 'BUSINESS') {
    await SettlementRepository.deleteAccountByUserId(userId);
  }

  await SettlementRepository.upsertIndividualAccount(userId, {
    bank: payload.bank,
    accountNumber: payload.accountNumber,
    holderName: payload.holderName,
  });

  const isUpdate = !!existingAccount && existingAccount.seller_type === 'INDIVIDUAL';
  return {
    message: isUpdate
      ? '판매자 정보가 성공적으로 수정되었습니다.'
      : '개인 판매자 등록이 완료되었습니다.',
    status: 'APPROVED' as const,
    requiresApproval: false,
  };
};

export const registerBusinessSeller = async (
  userId: number,
  dto: RegisterBusinessSellerRequestDto,
) => {
  if (
    !dto ||
    !dto.registerToken ||
    !dto.companyName ||
    dto.isTermsAgreed !== true
  ) {
    const error = new Error('필수 입력값이 누락되었거나 이용 약관에 동의하지 않았습니다.');
    error.name = 'ValidationError';
    throw error;
  }

  const payload = await consumeRegisterToken(dto.registerToken);

  if (payload.userId !== userId) {
    const error = new Error('등록 토큰의 사용자 정보가 요청과 일치하지 않습니다.');
    error.name = 'ValidationError';
    throw error;
  }
  if (payload.sellerType !== 'BUSINESS' || !payload.businessType || !payload.businessNumber) {
    const error = new Error('등록 토큰의 판매자 유형이 일치하지 않습니다.');
    error.name = 'ValidationError';
    throw error;
  }

  const existingAccount = await SettlementRepository.findAccountByUserId(userId);

  // 사업자등록번호 중복 검사 — 본인 row는 제외
  const existingBusiness = await SettlementRepository.findAccountByBusinessNumber(
    payload.businessNumber,
  );
  if (existingBusiness && existingBusiness.user_id !== userId) {
    const error = new Error('이미 등록되었거나 심사 대기 중인 사업자등록번호입니다.');
    error.name = 'DuplicateBusinessNumber';
    throw error;
  }

  // 최초 사업자 등록 시에는 사업자등록증 URL 필수.
  // 사업자 → 사업자 정보변경 시에만 생략 허용 (기존 URL 유지).
  const isBusinessUpdate = !!existingAccount && existingAccount.seller_type === 'BUSINESS';
  if (!isBusinessUpdate && !dto.businessLicenseUrl) {
    const error = new Error('사업자등록증 파일을 업로드해 주세요.');
    error.name = 'ValidationError';
    throw error;
  }

  if (!existingAccount) {
    // 최초 사업자 등록
    await SettlementRepository.createBusinessAccount(userId, {
      representativeName: payload.name,
      bank: payload.bank,
      accountNumber: payload.accountNumber,
      holderName: payload.holderName,
      businessNumber: payload.businessNumber,
      businessType: payload.businessType,
      companyName: dto.companyName,
      businessLicenseUrl: dto.businessLicenseUrl!,
    });
    return {
      message: '사업자 판매자 신청이 완료되었습니다. 관리자 승인 후 최종 등록됩니다.',
      status: 'PENDING' as const,
      requiresApproval: true,
    };
  }

  if (existingAccount.seller_type === 'INDIVIDUAL') {
    // 개인 → 사업자 전환: 기존 INDIVIDUAL 삭제 후 BUSINESS PENDING 신규 생성
    await SettlementRepository.deleteAccountByUserId(userId);
    await SettlementRepository.createBusinessAccount(userId, {
      representativeName: payload.name,
      bank: payload.bank,
      accountNumber: payload.accountNumber,
      holderName: payload.holderName,
      businessNumber: payload.businessNumber,
      businessType: payload.businessType,
      companyName: dto.companyName,
      businessLicenseUrl: dto.businessLicenseUrl!,
    });
    return {
      message: '사업자 판매자 변경 신청이 완료되었습니다. 관리자 승인 후 최종 등록됩니다.',
      status: 'PENDING' as const,
      requiresApproval: true,
    };
  }

  // BUSINESS → BUSINESS 정보 변경: 같은 row 덮어쓰기 + PENDING + is_active=false
  await SettlementRepository.updateBusinessAccountForApproval(userId, {
    representativeName: payload.name,
    bank: payload.bank,
    accountNumber: payload.accountNumber,
    holderName: payload.holderName,
    businessNumber: payload.businessNumber,
    businessType: payload.businessType,
    companyName: dto.companyName,
    businessLicenseUrl: dto.businessLicenseUrl,
  });
  return {
    message: '사업자 정보 변경 신청이 완료되었습니다. 관리자 승인 후 변경 사항이 반영됩니다.',
    status: 'PENDING' as const,
    requiresApproval: true,
  };
};
