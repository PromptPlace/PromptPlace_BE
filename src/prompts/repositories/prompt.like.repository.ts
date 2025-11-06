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
          user_id: true,
          title: true,
          prompt: true,
          prompt_result: true,
          has_image: true,
          description: true,
          usage_guide: true,
          price: true,
          is_free: true,
          downloads: true,
          views: true,
          likes: true,
          model_version: true,
          created_at: true,
          updated_at: true,
          inactive_date: true,
          _count: {
            select: {
              reviews: true,
            },
          },
         reviews: {
            select: {
              rating: true, 
            },
          },
          user: {
            select: {
              user_id: true,
              nickname: true,
              profileImage: true,
            },
          },
          models: {
            select: {
              promptmodel_id: true,
              prompt_id: true,
              model_id: true,
              model: {
                select: { name: true },
              },
            },
          },
          categories: true,
          images: {
            select: { image_url: true, image_id: true, order_index: true },
            orderBy: { order_index: 'asc' },
          },
          
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
};

export const removePromptLike = async (userId: number, promptId: number) => {
  return prisma.promptLike.delete({
    where: {
      user_id_prompt_id: {
        user_id: userId,
        prompt_id: promptId,
      },
    },
  });
};