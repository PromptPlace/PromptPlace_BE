import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface CreateReviewInput {
  promptId: number;
  userId: number;
  rating: number;
  content: string;
}

// 리뷰 생성 
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

// 프롬프트 ID로 리뷰 목록 조회
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

// 리뷰 작성자들의 닉네임 + 프로필 이미지 URL 조회
export const findUserProfilesByUserIds = async (userIds: number[]) => {
  return await prisma.user.findMany({
    where: {
      user_id: { in: userIds }
    },
    select: {
      user_id: true,
      nickname: true,
      profileImage: {
        select: {
          url: true
        }
      }
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

// 개별 리뷰 조회
export const findReviewById = async (reviewId: number) => {
  return await prisma.review.findUnique({
    where: {
      review_id: reviewId
    }
  });
};

// 리뷰 삭제
export const deleteReviewById = async (reviewId: number) => {
  await prisma.review.delete({
    where: {
      review_id: reviewId
    }
  });
};