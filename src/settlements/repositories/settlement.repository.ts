import prisma from '../../config/prisma';
import { SettlementAccount } from '@prisma/client';

export const SettlementRepository = {
  upsertSettlementAccount: async (
    userId: number,
    bankCode: string,
    accountNumber: string,
    accountHolder: string
  ) => {
    return await prisma.settlementAccount.upsert({
      where: { user_id: userId },
      update: {
        bank_code: bankCode,
        account_number: accountNumber,
        account_holder: accountHolder,
        is_active: true,
      },
      create: {
        user_id: userId,
        bank_code: bankCode,
        account_number: accountNumber,
        account_holder: accountHolder,
      },
    });
  },

  findAccountByUserId: async(userId: number): Promise<SettlementAccount | null> => {
    return await prisma.settlementAccount.findUnique({
      where: { user_id: userId},
    });
  }
};