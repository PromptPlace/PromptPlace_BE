import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const signupRepository = {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async createUser(email: string, hashedPassword: string, allConsents: { type: string, isAgreed: boolean }[]) {
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        status: true,
        role: "USER",
        name: '유저', 
        nickname: 'user_nickname'+ Date.now(),
        social_type: 'NONE',
      },
    });

    const consentRecords = allConsents.map(consent => ({
        user_id: newUser.user_id,
        consent_type: consent.type,
        is_agreed: consent.isAgreed,
    }));
    
    await prisma.userConsent.createMany({
        data: consentRecords,
    });

    return newUser;
  },
};