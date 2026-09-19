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
        dto.PCD_PAY_WORK !== 'CERT' ||
        typeof dto.PCD_PAY_REQKEY !== 'string' ||
        typeof dto.PCD_AUTH_KEY !== 'string' ||
        typeof dto.PCD_PAY_COFURL !== 'string' ||
        typeof dto.PCD_USER_DEFINE1 !== 'string'
      ) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'CERT 인증 결과의 주문번호, 승인 키, 승인 URL, 주문 정보는 필수입니다.',
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
