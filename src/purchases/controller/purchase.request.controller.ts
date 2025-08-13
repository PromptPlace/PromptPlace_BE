import { Request, Response, NextFunction } from 'express';
import { PurchaseRequestService } from '../services/purchase.request.service';

export const PurchaseRequestController = {
  async requestPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).user_id;
      const dto = req.body;
      const result = await PurchaseRequestService.createPurchaseRequest(userId, dto);
      res.status(result.statusCode).json(result);
    } catch (err) {
      next(err);
    }
  },
};