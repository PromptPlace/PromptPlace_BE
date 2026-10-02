import { NextFunction, Request, Response } from 'express';
import { PurchaseResultService } from '../services/purchase.result.service';

export const PurchaseResultController = {
  async getResult(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as { user_id: number }).user_id;
      const result = await PurchaseResultService.getResult(userId, req.params.orderId);
      return res.status(result.statusCode).json(result);
    } catch (err) {
      next(err);
    }
  },
};
