import { Request, Response } from 'express';
import {
  findReviewsByPromptId,
  createReviewService,
  deleteReviewService,
  getReviewEditDataService,
  editReviewService,
  findReviewsWrittenByUser,
} from '../services/review.service';

interface RawPromptParams {
  promptId: string;
}

interface RawPaginationQuery {
  cursor?: string;
  limit?: string;
}

export const getReviewsByPromptId = async (
  req: Request<RawPromptParams, any, any, RawPaginationQuery>,
  res: Response
): Promise<void> => {

    if (!req.user) {
      res.fail({
      statusCode: 401,
      error: 'no user',
      message: '로그인이 필요합니다.',
    });
    return;
  }

  try {
    const result = await findReviewsByPromptId(
      req.params.promptId,
      req.query.cursor,
      req.query.limit
    );

    
    res.success({
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.name || 'InternalServerError',
      message: err.message || '리뷰 목록 조회 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500
    });
  }
};


  export const postReview = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    console.log('req.user:', req.user); 
    if (!req.user) {
      res.fail({
        statusCode: 401,
        error: 'no user',
        message: '로그인이 필요합니다.',
      });
      return;
    }

    try {
      const userId = (req.user as { user_id: number }).user_id;
      const promptId = (req.params.promptId)?.toString();;
      const { rating, content } = req.body;

    if (!promptId) {
      res.status(400).json({ message: 'promptId가 없습니다.' });
      return;
    }

    const result = await createReviewService(promptId, userId, rating, content);

    res.success({
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.name || 'InternalServerError',
      message: err.message || '리뷰 작성 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500,
    });
  }
};


export const deleteReview = async (
  req: Request<{ reviewId: string }, any, any>,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.fail({
      statusCode: 401,
      error: 'no user',
      message: '로그인이 필요합니다.',
    });
    return;
  }

  try {
    const userId = (req.user as { user_id: number }).user_id;
    const reviewId = req.params.reviewId;

    if (!reviewId) {
      res.status(400).json({ message: '리뷰 ID가 없습니다.' });
      return;
    }

    await deleteReviewService(reviewId, userId);

    res.success({
      message: '리뷰가 성공적으로 삭제되었습니다.',
    });
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.name || 'InternalServerError',
      message: err.message || '리뷰 삭제 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500,
    });
  }
};


// 리뷰 수정 화면
export const getReviewEditData = async (
  req: Request<{ reviewId: string }, any, any>,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.fail({
      statusCode: 401,
      error: 'no user',
      message: '로그인이 필요합니다.',
    });
    return;
  }

  try {
    const reviewId = req.params.reviewId;

    if (!reviewId) {
      res.status(400).json({ message: '리뷰 ID가 없습니다.' });
      return;
    }

    const review = await getReviewEditDataService(
      reviewId,
      (req.user as {user_id: number}).user_id
    );

    res.success({ ...review });
    
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.name || 'InternalServerError',
      message: err.message || '리뷰 수정 화면을 불러오는 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500,
    });
  }
};


// 리뷰 수정 
export const editReview = async (
  req: Request<{ reviewId: string }, any, { rating: number; content: string }>,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.fail({
      statusCode: 401,
      error: 'no user',
      message: '로그인이 필요합니다.',
    });
    return;
  }

  try {
    const userId = (req.user as { user_id: number }).user_id;
    const reviewId = req.params.reviewId;
    const { rating, content } = req.body;

    if (!reviewId) {
      res.status(400).json({ message: '리뷰 ID가 없습니다.' });
      return;
    }

    if (rating == null || content == null) {
      res.status(400).json({ message: 'rating 또는 content가 누락되었습니다.' });
      return;
    }

    const updatedReview = await editReviewService(reviewId, userId, rating, content);

    res.success({
      message: '리뷰가 성공적으로 수정되었습니다.',
      data: updatedReview,
    });
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.name || 'InternalServerError',
      message: err.message || '리뷰 수정 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500,
    });
  }
};


// 내가 작성한 리뷰 목록 조회
export const getReviewsWrittenByMe = async (
  req: Request<any, any, any, RawPaginationQuery>,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.fail({
      statusCode: 401,
      error: 'no user',
      message: '로그인이 필요합니다.',
    });
    return;
  }

  try {
    const userId = (req.user as { user_id: number }).user_id;
    const { cursor, limit } = req.query;

    const reviews = await findReviewsWrittenByUser(userId, cursor, limit);

    res.success({
      statusCode: 200,
      message: '내가 작성한 리뷰 목록을 성공적으로 불러왔습니다.',
      data: {
        reviews,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.name || 'InternalServerError',
      message: err.message || '내가 작성한 리뷰 목록을 불러오는 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500,
    });
  }
};