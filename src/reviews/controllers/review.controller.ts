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

// 인증 미들웨어 적용 후 리팩토링 예정
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;


export const getReviewsByPromptId = async (
  req: Request<RawPromptParams, any, any, RawPaginationQuery>,
  res: Response
) => {
  try {
    const response = await findReviewsByPromptId(
      req.params.promptId,
      req.query.cursor,
      req.query.limit
    );

    return res.success(response);
  } catch (err: any) {
    console.error(err);
    return res.fail({
      error: err.name || 'InternalServerError',
      message: err.message || '리뷰 목록 조회 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500
    });
  }
};
export const postReview = async (req: Request, res: Response) => {
  try {
    const promptId = req.params.promptId?.toString();
    const { rating, content } = req.body;

    if (!promptId) {
      return res.status(400).json({ message: 'promptId가 없습니다.' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const userId = decoded.id;

    const result = await createReviewService(promptId, userId, rating, content);
    return res.success(result);
  } catch (err: any) {
    console.error(err);
    return res.fail({
      error: err.name || 'InternalServerError',
      message: err.message || '리뷰 작성 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500,
    });
  }
};
