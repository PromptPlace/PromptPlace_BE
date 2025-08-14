import { Request, Response } from 'express';
import { WithdrawalService } from '../services/withdrawal.service';

export const WithdrawalController = {
  async requestWithdrawal(req: Request, res: Response) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '로그인이 필요합니다.',
        statusCode: 401,
      });
    }

    try {
      const response = await WithdrawalService.requestWithdrawal(user.user_id, req.body);
      return res.status(200).json(response);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return res.status(status).json({
        error: err.error || 'InternalServerError',
        message: err.message || '서버 오류가 발생했습니다.',
        statusCode: status,
      });
    }
  }
};