import { Request, Response, NextFunction } from 'express';
import { getPopularPrompts } from '../services/admin-popular-prompts.service';

export const getPopularPromptsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getPopularPrompts();
    return res.success(result, '인기 프롬프트를 조회했습니다.');
  } catch (error) {
    return next(error);
  }
};
