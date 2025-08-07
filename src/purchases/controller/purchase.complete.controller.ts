import { Request, Response, NextFunction } from 'express';
import { PurchaseCompleteService } from '../services/purchase.complete.service';

export const PurchaseCompleteController = {
  async completePurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).user_id;
      const dto = req.body;
      const result = await PurchaseCompleteService.completePurchase(userId, dto);
      res.status(result.statusCode).json(result);
    } catch (err) {
      next(err);
    }
  },
};