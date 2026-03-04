import prisma from '../../config/prisma';
import { SettlementAccount } from '@prisma/client';
import { VerifyAccountRequestDto } from '../dtos/settlement.dto';

export const SettlementRepository = {
  upsertSettlementAccount: async (
    userId: number,
    dto: VerifyAccountRequestDto
  ): Promise<SettlementAccount> => {
    return await prisma.settlementAccount.upsert({
      where: { user_id: userId },
      update: {
        bank_code: dto.bank,              
        account_number: dto.accountNumber,
        account_holder: dto.holderName,
        is_active: true,
      },
      create: {
        user_id: userId,
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
  }
};