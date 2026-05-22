import prisma from '../../config/prisma';
import { SettlementAccount } from '@prisma/client';
import { BusinessKind } from '../dtos/settlement.dto';

export interface UpsertIndividualAccountInput {
  bank: string;
  accountNumber: string;
  holderName: string;
  birthDate: string;            // INDIVIDUAL은 Payple 인증에 birthDate 필수
}

export interface CreateBusinessAccountInput {
  representativeName: string;
  bank: string;
  accountNumber: string;
  holderName: string;
  businessNumber: string;
  businessType: BusinessKind;
  companyName: string;
  businessLicenseUrl: string;
  birthDate?: string;           // BUSINESS+PERSONAL일 때만 존재 (대표자 생년월일). CORPORATE는 undefined
}

export interface UpdateBusinessAccountInput {
  representativeName: string;
  bank: string;
  accountNumber: string;
  holderName: string;
  businessNumber: string;
  businessType: BusinessKind;
  companyName: string;
  // optional — 빈 값이면 기존 URL 유지
  businessLicenseUrl?: string | null;
  birthDate?: string;           // BUSINESS+PERSONAL일 때만 존재
}

export const SettlementRepository = {
  upsertIndividualAccount: async (
    userId: number,
    dto: UpsertIndividualAccountInput,
  ): Promise<SettlementAccount> => {
    return await prisma.settlementAccount.upsert({
      where: { user_id: userId },
      update: {
        bank_code: dto.bank,
        account_number: dto.accountNumber,
        account_holder: dto.holderName,
        birth_date: dto.birthDate,
        seller_type: 'INDIVIDUAL',
        business_type: null,
        status: 'APPROVED',
        is_active: true,
        business_number: null,
        company_name: null,
        representative_name: null,
        business_license_url: null,
      },
      create: {
        user_id: userId,
        bank_code: dto.bank,
        account_number: dto.accountNumber,
        account_holder: dto.holderName,
        birth_date: dto.birthDate,
        seller_type: 'INDIVIDUAL',
        status: 'APPROVED',
        is_active: true,
      },
    });
  },

  findAccountByUserId: async (userId: number): Promise<SettlementAccount | null> => {
    return await prisma.settlementAccount.findUnique({
      where: { user_id: userId },
    });
  },

  findAccountByBusinessNumber: async (businessNumber: string) => {
    return await prisma.settlementAccount.findFirst({
      where: { business_number: businessNumber },
    });
  },

  createBusinessAccount: async (userId: number, dto: CreateBusinessAccountInput) => {
    return await prisma.settlementAccount.create({
      data: {
        user_id: userId,
        bank_code: dto.bank,
        account_number: dto.accountNumber,
        account_holder: dto.holderName,
        business_number: dto.businessNumber,
        business_type: dto.businessType,
        company_name: dto.companyName,
        representative_name: dto.representativeName,
        business_license_url: dto.businessLicenseUrl,
        birth_date: dto.birthDate ?? null,
        seller_type: 'BUSINESS',
        status: 'PENDING',
        is_active: false,
      },
    });
  },

  // 사업자 → 사업자 정보변경.
  // 같은 row 덮어쓰기 + status=PENDING + is_active=false (관리자 승인 전까지 일시 비활성화).
  // businessLicenseUrl이 undefined면 기존 URL 유지.
  updateBusinessAccountForApproval: async (
    userId: number,
    dto: UpdateBusinessAccountInput,
  ) => {
    const data: Record<string, unknown> = {
      bank_code: dto.bank,
      account_number: dto.accountNumber,
      account_holder: dto.holderName,
      business_number: dto.businessNumber,
      business_type: dto.businessType,
      company_name: dto.companyName,
      representative_name: dto.representativeName,
      birth_date: dto.birthDate ?? null,
      seller_type: 'BUSINESS',
      status: 'PENDING',
      is_active: false,
    };
    if (dto.businessLicenseUrl) {
      data.business_license_url = dto.businessLicenseUrl;
    }
    return await prisma.settlementAccount.update({
      where: { user_id: userId },
      data,
    });
  },

  deleteAccountByUserId: async (userId: number) => {
    return await prisma.settlementAccount.delete({
      where: { user_id: userId },
    });
  },
};
