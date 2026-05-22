import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { AppError } from '../../errors/AppError';
import {
  RegisterIndividualSellerRequestDto,
  RegisterBusinessSellerRequestDto,
} from '../dtos/settlement.dto';
import { SettlementRepository } from '../repositories/settlement.repository';
import { consumeRegisterToken } from '../utils/register-token';

export const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export const uploadFileToS3 = async (
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return `https://${process.env.S3_BUCKET!}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
};

export const uploadBusinessLicenseFile = async (
  userId: number,
  file: Express.Multer.File,
) => {
  try {
    const ext = path.extname(file.originalname);
    const uniqueKey = `business-licenses/${userId}-${Date.now()}${ext}`;
    const fileUrl = await uploadFileToS3(uniqueKey, file.buffer, file.mimetype);

    return {
      message: '사업자등록증 업로드가 완료되었습니다.',
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
    !dto.businessLicenseUrl ||
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
  if (existingAccount) {
    const error = new Error('이미 판매자로 등록되었거나 승인 심사 대기 중인 회원입니다.');
    error.name = 'AlreadyRegistered';
    throw error;
  }

  const existingBusiness = await SettlementRepository.findAccountByBusinessNumber(payload.businessNumber);
  if (existingBusiness) {
    const error = new Error('이미 등록되었거나 심사 대기 중인 사업자등록번호입니다.');
    error.name = 'DuplicateBusinessNumber';
    throw error;
  }

  await SettlementRepository.createBusinessAccount(userId, {
    representativeName: payload.name,
    bank: payload.bank,
    accountNumber: payload.accountNumber,
    holderName: payload.holderName,
    businessNumber: payload.businessNumber,
    businessType: payload.businessType,
    companyName: dto.companyName,
    businessLicenseUrl: dto.businessLicenseUrl,
  });

  return { message: '사업자 판매자 신청이 완료되었습니다. 관리자 승인 후 최종 등록됩니다.' };
};
