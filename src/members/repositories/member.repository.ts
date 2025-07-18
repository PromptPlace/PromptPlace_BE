import prisma from '../../config/prisma';

class MemberRepository {
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