import {
  mapToReviewResponse,
  mapToReviewListDTO,
  mapToReviewEditDataDTO,
  mapToReviewUpdateResponse,
  mapToMyReviewListDTO,
  mapToMyReceivedReviewListDTO,
} from '../dtos/review.dto';
import {
  findAllReviewsByPromptId,
  findUserProfilesByUserIds,
  createReview,
  findReviewById,
  deleteReviewById,
  findPromptById,
  findNicknameByUserId,
  findModelByPromptId,
  updateReviewById,
  findAllReviewsByUserId,
  findAllMyReviewsByUserId,
  findUserById,
  CountReivewsbyPromptId,
  CountReivewsbyUserId,
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

  // 리뷰 개수 불러오기
  const totalCount = await CountReivewsbyPromptId(promptId);
  // 리뷰 불러오기(limit+1개)
  const rawReviews: Review[] = await findAllReviewsByPromptId(promptId, cursor, limit);
  // hasMore 계산
  const hasMore = rawReviews.length > limit;  
  // limit까지만 잘라서 사용
  const slicedReviews = hasMore ? rawReviews.slice(0, limit) : rawReviews;
  // 리뷰 작성자 user_id 리스트
  const userIds = rawReviews.map(review => review.user_id);
  // 사용자 프로필 정보 가져오기 (nickname + image_url)
  const userProfiles = await findUserProfilesByUserIds(userIds);
  
  // DTO로 변환
  return mapToReviewListDTO(slicedReviews, userProfiles, limit, totalCount, hasMore);
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

// 리뷰 삭제
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

  const user = await findUserById(userId);
  if(!user) {
    throw {
      name: 'NotFound',
      message: '해당 사용자를 찾을 수 없습니다.',
      statusCode: 404
    };
  }

  const isAdmin = user.role === 'ADMIN'; // 관리자 여부 확인
  
  // 일반 사용자일 경우 
  if (!isAdmin) { 
    if (review.user_id !== userId) {
      throw {
        name: 'Forbidden',
        message: '리뷰를 삭제할 권한이 없습니다.',
        statusCode: 403,
      };
    }

    const now = new Date();
    const createdAt = new Date(review.created_at);
    const diffInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffInDays > 30) {
      throw {
        name: 'Forbidden',
        message: '리뷰 작성일로부터 30일이 지나 삭제할 수 없습니다.',
        statusCode: 403,
      };
    }
  }

  // 관리자일 경우 바로 삭제
  await deleteReviewById(numericReviewId);
};

// 리뷰 수정 화면
export const getReviewEditDataService = async (reviewId: string, currentUserId: number) => {

  if (!reviewId || isNaN(Number(reviewId))) {
    throw new Error('유효하지 않은 reviewId입니다.');
  }



  const numericReviewId = Number(reviewId);
  const review = await findReviewById(numericReviewId);

  if (!review) {
    throw new Error('해당 리뷰를 찾을 수 없습니다.');
  }

  // 작성자 확인 (토큰 유저 vs 리뷰 작성자)
  if (review.user_id !== currentUserId) {
    const error = new Error('해당 리뷰에 대한 수정 권한이 없습니다.');
    (error as any).statusCode = 403;
    (error as any).name = 'Forbidden';
    throw error;
  }


  const prompt = await findPromptById(review.prompt_id);

  if (!prompt) {
    throw new Error('해당 리뷰에 대한 프롬프트를 찾을 수 없습니다.');
  }

  const prompterNickname = await findNicknameByUserId(prompt.user_id); 

  if (!prompterNickname) 
    throw new Error('작성자의 닉네임을 찾을 수 없습니다.');

  const model = await findModelByPromptId(prompt.prompt_id);

  if (!model) {
    throw new Error('프롬프트에 연결된 모델을 찾을 수 없습니다.');
  }

  return mapToReviewEditDataDTO({
    review,
    prompt,
    modelId: model.model_id,
    modelName: model.model_name,
    prompterId: prompt.user_id, 
    prompterNickname
  });
};

// 리뷰 수정
export const editReviewService = async (
  reviewId: string,
  userId: number,
  rating?: number,
  content?: string
) => {
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
      message: '리뷰를 수정할 권한이 없습니다.',
      statusCode: 403
    };
  }

  const now = new Date();
  const createdAt = new Date(review.created_at);
  const diffInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  if (diffInDays > 30) {
    throw {
      name: 'Forbidden',
      message: '리뷰 작성일로부터 30일이 지나 수정할 수 없습니다.',
      statusCode: 403
    };
  }

  const updated = await updateReviewById(numericReviewId, {
    rating,
    content
  });

  const writerName = await findNicknameByUserId(userId);
  
  return mapToReviewUpdateResponse(updated, writerName || '알 수 없음');
};

// 내가 작성한 리뷰 목록 조회 
export const findReviewsWrittenByUser = async (
  userId: number,
  rawCursor?: string,
  rawLimit?: string
) => {
  const cursor = rawCursor ? parseInt(rawCursor, 10) : undefined;
  const limit = rawLimit ? parseInt(rawLimit, 10) : 10;

  if (cursor !== undefined && isNaN(cursor)) throw new Error('cursor값이 적절하지 않습니다');
  if (isNaN(limit)) throw new Error('limit값이 적절하지 않습니다');

  // 리뷰 개수 불러오기
  const totalCount = await CountReivewsbyUserId(userId);
  // 리뷰 불러오기(limit+1)
  const rawReviews = await findAllReviewsByUserId(userId, cursor, limit);
  // hasMore계산
  const hasMore = rawReviews.length > limit;
  // limit까지만 잘라서 사용
  const slicedReviews = hasMore ? rawReviews.slice(0, limit) : rawReviews;

  return mapToMyReviewListDTO(slicedReviews, hasMore);
};

// 내가 받은 리뷰 목록 조회
export const findMyReceivedReviews = async (
  userId: number,
  rawCursor?: string,
  rawLimit?: string
) => {
  const cursor = rawCursor ? parseInt(rawCursor, 10) : undefined;
  const limit = rawLimit ? parseInt(rawLimit, 10) : 10;

  if (cursor !== undefined && isNaN(cursor)) throw new Error('cursor값이 적절하지 않습니다');
  if (isNaN(limit)) throw new Error('limit값이 적절하지 않습니다');

  const rawReviews = await findAllMyReviewsByUserId(userId, cursor, limit);
  const writerIds = rawReviews.map(review => review.user_id);
  const userProfiles = await findUserProfilesByUserIds(writerIds);
  return mapToMyReceivedReviewListDTO(rawReviews, userProfiles, limit);
};