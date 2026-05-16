import { Request, Response, NextFunction } from 'express';
import { getVisitorStats } from '../services/admin-visitor-stats.service';
import { VisitorStatsQueryDto } from '../dtos/admin-stats.dto';

export const getVisitorStatsHandler = async (
  req: Request<unknown, unknown, unknown, VisitorStatsQueryDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getVisitorStats(req.query.month);
    return res.success(result, '방문자 통계를 조회했습니다.');
  } catch (error) {
    return next(error);
  }
};
