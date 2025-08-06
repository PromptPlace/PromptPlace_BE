import { Request, Response, NextFunction } from 'express';
import { PurchaseRequestService } from '../services/purchase.request.service';
import { PromptPurchaseRequestDTO } from '../dtos/purchase.request.dto';

export const PurchaseRequestController = {
  async createPurchaseRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.user_id; // JWT 인증 미들웨어에서 세팅된 사용자 ID
      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: '로그인이 필요합니다.',
          statusCode: 401,
        });
      }

      const dto: PromptPurchaseRequestDTO = req.body;
      const result = await PurchaseRequestService.createPurchaseRequest(userId, dto);
      res.status(result.statusCode).json(result);
    } catch (err) {
      next(err);
    }
  },
};