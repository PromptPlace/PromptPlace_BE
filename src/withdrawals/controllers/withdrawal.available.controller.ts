import { Request, Response } from 'express';
import { WithdrawalAvailableService } from '../services/withdrawal.available.service';

export const WithdrawalAvailableController = {
  async getAvailable(req: Request, res: Response) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '로그인이 필요합니다.',
        statusCode: 401,
      });
    }

    try {
      const result = await WithdrawalAvailableService.getAvailableAmount(user.user_id);
      return res.status(200).json(result);
    } catch (e: any) {
      return res.status(500).json({
        error: 'InternalServerError',
        message: '서버 오류가 발생했습니다.',
        statusCode: 500,
      });
    }
  }
};