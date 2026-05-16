import { Request, Response, NextFunction } from 'express';
import {
  getActiveUserStats,
  getMemberStats,
} from '../services/admin-stats.service';

export const getMemberStatsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getMemberStats();
    return res.success(result, '회원 가입 현황을 조회했습니다.');
  } catch (error) {
    return next(error);
  }
};

export const getActiveUserStatsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getActiveUserStats();
    return res.success(result, '활성 사용자 통계를 조회했습니다.');
  } catch (error) {
    return next(error);
  }
};
