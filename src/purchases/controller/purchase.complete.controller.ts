import { Request, Response, NextFunction } from 'express';
import { PurchaseCompleteRequestDTO } from '../dtos/purchase.complete.dto';
import { PurchaseCompleteService } from '../services/purchase.complete.service';

export const PurchaseCompleteController = {
  async completePurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).user_id;
      const dto = req.body as Partial<PurchaseCompleteRequestDTO>;

      if (
        !dto ||
        typeof dto.PCD_PAY_OID !== 'string' ||
        typeof dto.PCD_PAY_REQKEY !== 'string' ||
        typeof dto.PCD_AUTH_KEY !== 'string'
      ) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'PCD_PAY_OID, PCD_PAY_REQKEY, PCD_AUTH_KEY는 필수입니다.',
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
