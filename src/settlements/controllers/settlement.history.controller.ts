import { Request, Response } from 'express';
import { SettlementHistoryService } from '../services/settlement.history.service';

export const getMonthlySales = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '로그인이 필요합니다.',
        statusCode: 401,
      });
    }

    const userId = (user as { user_id: number }).user_id;
    const now = new Date();
    const year = req.query.year ? Number(req.query.year) : now.getUTCFullYear();
    const month = req.query.month ? Number(req.query.month) : now.getUTCMonth() + 1;

    const result = await SettlementHistoryService.getMonthlySales(userId, year, month);
    return res.status(200).json(result);
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      error: error.type || 'InternalServerError',
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      statusCode: status,
    });
  }
};

export const getYearlySettlements = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '로그인이 필요합니다.',
        statusCode: 401,
      });
    }

    const userId = (user as { user_id: number }).user_id;
    const result = await SettlementHistoryService.getYearlySettlements(userId);
    return res.status(200).json(result);
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      error: error.type || 'InternalServerError',
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      statusCode: status,
    });
  }
};
