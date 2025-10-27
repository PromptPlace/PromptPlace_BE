import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const signupRepository = {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async createUser(email: string, hashedPassword: string) {
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        status: true,
        role: "USER",
        name: '미정', 
        nickname: 'temp_user_nickname',
        social_type: 'NONE',
      },
    });
  },
};