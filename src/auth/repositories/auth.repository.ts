import prisma from '../../config/prisma';

class AuthRepository {
  async saveRefreshToken(token: string, userId: number, expiresAt: Date): Promise<void> {
    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async deleteRefreshTokensByUserId(userId: number): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}

export default new AuthRepository(); 