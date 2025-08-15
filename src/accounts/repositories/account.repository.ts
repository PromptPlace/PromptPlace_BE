import prisma from "../../config/prisma";

export const AccountRepository = {
  findBankByCode: async (code: string) => {
    return await prisma.bank.findUnique({ where: { code } });
  },

  findUserBankAccount: async (user_id: number) => {
    return await prisma.userBankAccount.findUnique({ where: { user_id } });
  },

  findPreRegisteredAccount: async (data: {
    bank_code: string;
    account_number: string;
    account_holder: string;
    owner_user_id: number;
  }) => {
    return await prisma.preRegisteredAccount.findFirst({
      where: {
        bank_code: data.bank_code,
        account_number: data.account_number,
        account_holder: data.account_holder,
        owner_user_id: data.owner_user_id,
        is_active: true,
      },
    });
  },

  createPreRegisteredAccount: async (data: {
    bank_code: string;
    account_number: string;
    account_holder: string;
    owner_user_id: number;
  }) => {
    return await prisma.preRegisteredAccount.create({
      data: {
        ...data,
        is_active: true,
      },
    });
  },

  createUserBankAccount: async (data: {
    user_id: number;
    preregistered_id: number;
  }) => {
    return await prisma.userBankAccount.create({
      data: {
        user_id: data.user_id,
        preregistered_id: data.preregistered_id,
      },
    });
  },

  getUserBankAccount: async (userId: number) => {
    return prisma.userBankAccount.findUnique({
      where: { user_id: userId },
      include: {
        preregistered: {
          include: {
            bank: true, // bank.name 포함
          },
        },
      },
    });
  },
};