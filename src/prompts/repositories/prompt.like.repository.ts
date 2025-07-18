import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const findPromptById = async (promptId: number) => {
  return prisma.prompt.findUnique({
    where: { prompt_id: promptId },
  });
};

export const hasLikedPrompt = async (userId: number, promptId: number) => {
  return prisma.promptLike.findUnique({
    where: {
      user_id_prompt_id: {
        user_id: userId,
        prompt_id: promptId,
      },
    },
  });
};

export const addPromptLike = async (userId: number, promptId: number) => {
  return prisma.promptLike.create({
    data: {
      user_id: userId,
      prompt_id: promptId,
    },
  });
};

export const getLikedPromptsByUser = async (userId: number) => {
  return prisma.promptLike.findMany({
    where: { user_id: userId },
    include: {
      prompt: {
        select: {
          prompt_id: true,
          title: true,
          description: true,
          is_free: true,
          download_url: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
};