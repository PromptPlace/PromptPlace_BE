import prisma from '../../config/prisma';
import { SettlementAccount } from '@prisma/client';
import { BusinessKind } from '../dtos/settlement.dto';

export interface UpsertIndividualAccountInput {
  bank: string;
  accountNumber: string;
  holderName: string;
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
        seller_type: 'INDIVIDUAL',
        business_type: null,
        status: 'APPROVED',
        is_active: true,
        birth_date: null,
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
        seller_type: 'BUSINESS',
        status: 'PENDING',
        is_active: false,
      },
    });
  },

  deleteAccountByUserId: async (userId: number) => {
    return await prisma.settlementAccount.delete({
      where: { user_id: userId },
    });
  },
};
