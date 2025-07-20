import prisma from '../../config/prisma';

class MemberRepository {
  async upsertProfileImage(userId: number, imageUrl: string): Promise<void> {
    await prisma.userImage.upsert({
      where: { userId },
      update: { url: imageUrl },
      create: { userId, url: imageUrl },
    });
  }

  async softDeleteUser(userId: number): Promise<void> {
    await prisma.user.update({
      where: { user_id: userId },
      data: {
        status: false,
        inactive_date: new Date(),
      },
    });
  }
}

export default new MemberRepository(); 