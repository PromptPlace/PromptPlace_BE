import { Request, Response, NextFunction } from 'express';
import {
  getNewPromptStats,
  getTopSalesPrompts,
} from '../services/admin-prompt-stats.service';

export const getNewPromptStatsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getNewPromptStats();
    return res.success(result, '신규 프롬프트 통계를 조회했습니다.');
  } catch (error) {
    return next(error);
  }
};

export const getTopSalesPromptsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getTopSalesPrompts();
    return res.success(result, '매출 상위 프롬프트를 조회했습니다.');
  } catch (error) {
    return next(error);
  }
};
