import prisma from '../../config/prisma';
import { SettlementAccount } from '@prisma/client';
import { VerifyAccountRequestDto, RegisterBusinessSellerRequestDto} from '../dtos/settlement.dto';

export const SettlementRepository = {
  upsertSettlementAccount: async (
    userId: number,
    dto: VerifyAccountRequestDto
  ): Promise<SettlementAccount> => {
    return await prisma.settlementAccount.upsert({
      where: { user_id: userId },
      update: {
        birth_date: dto.birthDate,
        bank_code: dto.bank,          
        account_number: dto.accountNumber,
        account_holder: dto.holderName,
        is_active: true,
      },
      create: {
        user_id: userId,
        birth_date: dto.birthDate,
        bank_code: dto.bank,
        account_number: dto.accountNumber,
        account_holder: dto.holderName,
      },
    });
  },

  findAccountByUserId: async(userId: number): Promise<SettlementAccount | null> => {
    return await prisma.settlementAccount.findUnique({
      where: { user_id: userId},
    });
  },

  findAccountByBusinessNumber: async (businessNumber: string) => {
  return await prisma.settlementAccount.findFirst({
    where: { business_number: businessNumber },
  });
},

  createBusinessAccount: async (userId: number, dto: RegisterBusinessSellerRequestDto) => {
  return await prisma.settlementAccount.create({
    data: {
      user_id: userId,
      bank_code: dto.bank,
      account_number: dto.accountNumber,
      account_holder: dto.holderName,
      business_number: dto.businessNumber,
      company_name: dto.companyName,
      representative_name: dto.representativeName,
      business_license_url: dto.businessLicenseUrl,
      seller_type: 'BUSINESS', 
      status: 'PENDING',       
      is_active: false,        
    }})
  }
};