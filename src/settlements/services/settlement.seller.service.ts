import path from "path";
import axios from 'axios';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { AppError } from "../../errors/AppError";
import { RegisterIndividualSellerRequestDto, RegisterBusinessSellerRequestDto} from '../dtos/settlement.dto';
import { SettlementRepository } from '../repositories/settlement.repository';

export const registerIndividualSeller = async (userId: number, dto: RegisterIndividualSellerRequestDto) => {
  // 1. 필수값 누락 및 약관 동의 여부 검증 (400)
  if (!dto.name || !dto.birthDate || !dto.bank || !dto.accountNumber || !dto.holderName || dto.isTermsAgreed !== true) {
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

  const PAYPLE_HUB_URL = process.env.PAYPLE_HUB_URL;
  const cst_id = process.env.PAYPLE_CST_ID;
  const custKey = process.env.PAYPLE_CUST_KEY;
  const randomCode = crypto.randomBytes(5).toString('hex'); 

  try {
    const authResponse = await axios.post(`${PAYPLE_HUB_URL}/oauth/token`, {
      cst_id: cst_id,
      custKey: custKey,
      code: randomCode
    }, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
    });

    if (authResponse.data.result !== 'T0000') {
      throw new Error(`페이플 인증 실패: ${authResponse.data.message}`);
    }

    const accessToken = authResponse.data.access_token;

    const verifyResponse = await axios.post(`${PAYPLE_HUB_URL}/inquiry/real_name`, {
      cst_id: cst_id,
      custKey: custKey,
      sub_id: `user_${userId}`,
      bank_code_std: dto.bank,
      account_num: dto.accountNumber,
      account_holder_info_type: "0", 
      account_holder_info: dto.birthDate 
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (verifyResponse.data.result !== 'A0000') {
      const error = new Error(verifyResponse.data.message || '유효하지 않은 계좌 정보입니다.');
      error.name = 'AccountVerificationError';
      throw error;
    }

    if (verifyResponse.data.account_holder_name !== dto.holderName) {
      const error = new Error('입력하신 예금주명과 실제 계좌의 예금주명이 일치하지 않습니다.');
      error.name = 'AccountVerificationError';
      throw error;
    }

  } catch (err: any) {
    if (err.name === 'AccountVerificationError') throw err;
    const error = new Error(err.response?.data?.message || '계좌 인증 처리 중 서버 오류가 발생했습니다.');
    error.name = 'AccountVerificationError';
    throw error;
  }

  await SettlementRepository.upsertSettlementAccount(userId, {
    name: dto.name,
    birthDate: dto.birthDate,
    bank: dto.bank,
    accountNumber: dto.accountNumber,
    holderName: dto.holderName,
  });

  return { message: existingAccount 
    ? '판매자 정보가 성공적으로 수정되었습니다.' 
    : '개인 판매자 등록이 완료되었습니다.' };
};

export const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export const uploadFileToS3 = async (key: string, buffer: Buffer, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  
  await s3Client.send(command);
  
  // 업로드된 파일의 S3 URL 반환
  return `https://${process.env.S3_BUCKET!}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
};

export const uploadBusinessLicenseFile = async (userId: number, file: Express.Multer.File) => {
  try {
    const ext = path.extname(file.originalname);
  
    const uniqueKey = `business-licenses/${userId}-${Date.now()}${ext}`;

    const fileUrl = await uploadFileToS3(uniqueKey, file.buffer, file.mimetype);

    return { 
      message: '사업자등록증 업로드가 완료되었습니다.', 
      fileUrl: fileUrl
    };
  } catch (error) {
    console.error("S3 업로드 에러:", error);
    throw new AppError("파일 업로드 중 서버 오류가 발생했습니다.", 500, "InternalServerError");
  }
};

export const registerBusinessSeller = async (userId: number, dto: RegisterBusinessSellerRequestDto) => {
  // 1. 필수값 누락 및 약관 동의 여부 검증 (400)
  if (
    !dto.representativeName || !dto.bank || !dto.accountNumber || 
    !dto.holderName || !dto.businessNumber || !dto.companyName || 
    !dto.businessLicenseUrl || dto.isTermsAgreed !== true
  ) {
    const error = new Error('필수 입력값이 누락되었거나 이용 약관에 동의하지 않았습니다.');
    error.name = 'ValidationError';
    throw error;
  }

  // 2. 이미 등록되었거나 심사 대기 중인 유저인지 검증 (409)
  const existingAccount = await SettlementRepository.findAccountByUserId(userId);
  if (existingAccount) {
    const error = new Error('이미 판매자로 등록되었거나 승인 심사 대기 중인 회원입니다.');
    error.name = 'AlreadyRegistered';
    throw error;
  }

  // 3. 중복된 사업자등록번호인지 검증 (409)
  const existingBusiness = await SettlementRepository.findAccountByBusinessNumber(dto.businessNumber);
  if (existingBusiness) {
    const error = new Error('이미 등록되었거나 심사 대기 중인 사업자등록번호입니다.');
    error.name = 'DuplicateBusinessNumber';
    throw error;
  }

  // 4. 검증 통과 시 DB 저장 (상태: PENDING)
  await SettlementRepository.createBusinessAccount(userId, dto);

  return { message: '사업자 판매자 신청이 완료되었습니다. 관리자 승인 후 최종 등록됩니다.' };
};