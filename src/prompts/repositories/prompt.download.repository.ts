import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const PromptDownloadRepository = {
  async findById(promptId: number) {
    return prisma.prompt.findUnique({
      where: { prompt_id: promptId },
    });
  },

  async getDownloadedPromptsByUser(userId: number) {
    return prisma.purchase.findMany({
      where: { user_id: userId },
      include: {
        prompt: {
          select: {
            prompt_id: true,
            title: true,
            models: {
              include: {
                model: { select: { name: true } },
              },
            },
            reviews: {
              where: { user_id: userId },
              select: { created_at: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }
};