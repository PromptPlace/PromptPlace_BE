import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface CreateReviewInput {
  promptId: number;
  userId: number;
  rating: number;
  content: string;
}

export const createReviewInDB = async (data: CreateReviewInput) => {
  return await prisma.review.create({
    data: {
      prompt_id: data.promptId,
      user_id: data.userId,
      rating: data.rating,
      content: data.content
    }
  });
};

export const findAllByPromptId = async (
  promptId: number,
  cursor?: number,
  limit?: number
) => {
  return await prisma.review.findMany({
    where: {
      prompt_id: promptId,
      ...(cursor && { review_id: { lt: cursor } })
    },
    orderBy: {
      review_id: 'desc'
    },
    take: limit
  });
};

export const findNicknameByUserId = async (userIds: number[]) => {
  return await prisma.user.findMany({
    where: {
      user_id: { in: userIds }
    },
    select: {
      user_id: true,
      nickname: true
    }
  });
};

export const createReview = async ({
  promptId,
  userId, 
  rating,
  content
}: CreateReviewInput) => {
    return await prisma.review.create({
        data: {
          prompt_id: promptId,
          user_id: userId,
          rating,
          content
        }
    });
};