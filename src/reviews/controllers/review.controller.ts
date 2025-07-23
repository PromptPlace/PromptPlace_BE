import { Request, Response } from 'express';
import {
  findReviewsByPromptId,
  createReviewService
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
