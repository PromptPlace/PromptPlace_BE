import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const PromptDownloadRepository = {
  async findById(promptId: number) {
    return prisma.prompt.findUnique({
      where: { prompt_id: promptId },
    });
  },

  async increaseDownload(promptId: number) {
    return prisma.prompt.update({
      where: { prompt_id: promptId },
      data: {
        downloads: {
          increment: 1,
        },
      },
      select: {
        prompt_id: true,
        downloads: true,
      },
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
            description: true,
            price: true,
            user: {
              select: {
                nickname: true, 
                profileImage: { 
                  select: { url: true },
                },
              },
            },
            models: {
              include: {
                model: { select: { name: true } },
              },
            },
            images: {
              select: { image_url: true },
              orderBy: { order_index: 'asc' },
            },
           reviews: {
              where: { user_id: userId },
              select: { 
                content: true, 
                rating: true, 
                created_at: true 
              },
              take: 1,
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }
};