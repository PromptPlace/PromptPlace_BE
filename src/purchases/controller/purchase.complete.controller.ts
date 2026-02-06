import { Request, Response, NextFunction } from 'express';
import { PurchaseCompleteRequestDTO } from '../dtos/purchase.complete.dto';
import { PurchaseCompleteService } from '../services/purchase.complete.service';

export const PurchaseCompleteController = {
  async completePurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).user_id;
      const dto = req.body as Partial<PurchaseCompleteRequestDTO>;

      if (!dto || typeof dto.paymentId !== 'string') {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'paymentId는 필수입니다.',
          statusCode: 400,
        });
      }

      const result = await PurchaseCompleteService.completePurchase(userId, dto as PurchaseCompleteRequestDTO);
      res.status(result.statusCode).json(result);
    } catch (err) {
      next(err);
    }
  },
};