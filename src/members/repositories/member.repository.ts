import prisma from '../../config/prisma';

class MemberRepository {
  async findMemberById(memberId: number) {
    return prisma.user.findUnique({
      where: { user_id: memberId },
      include: {
        intro: true, // UserIntro 정보 포함
      },
    });
  }

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

  async upsertUserIntro(userId: number, intro: string) {
    return prisma.userIntro.upsert({
      where: { user_id: userId },
      update: { description: intro },
      create: { user_id: userId, description: intro },
    });
  }

  async updateUserIntro(userId: number, intro: string) {
    return prisma.userIntro.update({
      where: { user_id: userId },
      data: { description: intro },
    });
  }

  async createHistory(userId: number, history: string) {
    return prisma.userHistory.create({
      data: {
        user_id: userId,
        history: history,
      },
    });
  }

  async findHistoryById(historyId: number) {
    return prisma.userHistory.findUnique({
      where: { history_id: historyId },
    });
  }

  async updateHistory(historyId: number, userId: number, history: string) {
    return prisma.userHistory.update({
      where: {
        history_id: historyId,
        user_id: userId,
      },
      data: {
        history: history,
      },
    });
  }

  async deleteHistory(historyId: number, userId: number) {
    return prisma.userHistory.delete({
      where: {
        history_id: historyId,
        user_id: userId,
      },
    });
  }
}

export default new MemberRepository();