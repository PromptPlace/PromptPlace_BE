import {
  mapToReviewResponse,
  mapToReviewListDTO,
  
} from '../dtos/review.dtos';
import {
  findAllByPromptId,
  findNicknameByUserId,
  createReview,
  findReviewById,
  deleteReviewById
} from '../repositories/review.repository';
import { Review } from '@prisma/client';



export const findReviewsByPromptId = async (
  rawPromptId: string,
  rawCursor?: string,
  rawLimit?: string
) => {
  const promptId = parseInt(rawPromptId, 10);
  const cursor = rawCursor ? parseInt(rawCursor, 10) : undefined;
  const limit = rawLimit ? parseInt(rawLimit, 10) : 10;

  if (isNaN(promptId)) throw new Error('promptId값이 적절하지 않습니다');
  if (cursor !== undefined && isNaN(cursor)) throw new Error('cursor값이 적절하지 않습니다');
  if (isNaN(limit)) throw new Error('limit값이 적절하지 않습니다');

  const rawReviews: Review[] = await findAllByPromptId(promptId, cursor, limit);
  const userIds = rawReviews.map(review => review.user_id);
  const userNicknames = await findNicknameByUserId(userIds);

  return mapToReviewListDTO(rawReviews, userNicknames, limit);
};




export const createReviewService = async (
  promptId: string, 
  userId: number, 
  rating: number, 
  content: string
) => {


  if (!promptId || isNaN(Number(promptId))) {
    throw new Error('유효하지 않은 promptId입니다.');
  }

  const newReview = await createReview({
    promptId: Number(promptId),
    userId,
    rating,
    content
  });

  return mapToReviewResponse(newReview);
};


export const deleteReviewService = async (
  reviewId: string,
  userId: number
): Promise<void> => {
  if (!reviewId || isNaN(Number(reviewId))) {
    throw {
      name: 'BadRequest',
      message: '유효하지 않은 reviewId입니다.',
      statusCode: 400
    };
  }

  const numericReviewId = Number(reviewId);

  const review = await findReviewById(numericReviewId);

  if (!review) {
    throw {
      name: 'NotFound',
      message: '해당 리뷰를 찾을 수 없습니다.',
      statusCode: 404
    };
  }

  if (review.user_id !== userId) {
    throw {
      name: 'Forbidden',
      message: '리뷰를 삭제할 권한이 없습니다.',
      statusCode: 403
    };
  }

  await deleteReviewById(numericReviewId);
};
