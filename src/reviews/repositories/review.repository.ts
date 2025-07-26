
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


export const findReviewById = async (reviewId: number) => {
  return await prisma.review.findUnique({
    where: {
      review_id: reviewId
    }
  });
};

export const deleteReviewById = async (reviewId: number) => {
  await prisma.review.delete({
    where: {
      review_id: reviewId
    }
  });
};

export const findPromptById = async (promptId: number) => {
  return await prisma.prompt.findUnique({
    where: {
      prompt_id: promptId
    }
  });
};

// 사용자 ID로 닉네임만 조회
export const findNicknameByUserId = async (userId: number): Promise<string | null> => {
  const user = await prisma.user.findUnique({
    where: {
      user_id: userId
    },
    select: {
      nickname: true
    }
  });

  return user?.nickname || null;
};


// 프롬프트 ID로 모델 조회

export const findModelByPromptId = async (promptId: number): Promise<{ model_id: number; model_name: string } | null> => {
  const promptModel = await prisma.promptModel.findFirst({
    where: { prompt_id: promptId },
    include: {
      model: {
        select: {
          model_id: true,
          name: true
        }
      }
    }
  });
  if(!promptModel?.model) return null;

  return {
    model_id: promptModel.model.model_id,
    model_name: promptModel.model.name
  };
};

// 리뷰 수정
export const updateReviewById = async (
  reviewId: number,
  data: {
    rating?: number;
    content?: string;
  }
) => {
  return await prisma.review.update({
    where: {
      review_id: reviewId
    },
    data: {
      ...(data.rating !== undefined && { rating: data.rating }), // rating 필드가 undefined가 아닐 때만 업데이트
      ...(data.content !== undefined && { content: data.content }) // content 필드가 undefined가 아닐 때만 업데이트
    }
  });
};
