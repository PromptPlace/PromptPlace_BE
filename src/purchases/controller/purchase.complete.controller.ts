import { Request, Response, NextFunction } from 'express';
import { PromptPurchaseCompleteRequestDTO } from '../dtos/purchase.complete.dto';
import { PurchaseCompleteService } from '../services/purchase.complete.service';

export const PurchaseCompleteController = {
  async completePurchase(req: Request, res: Response, next: NextFunction) {
    try {
       console.log('🔥 요청 바디 확인:', req.body); // ← 여기에 로그 찍기
      console.log('🔥 Content-Type:', req.headers['content-type']); // ← 헤더도 확인
      
      const userId = (req.user as any).user_id;
      const dto = req.body as Partial<PromptPurchaseCompleteRequestDTO>;

      if (!dto || typeof dto.imp_uid !== 'string' || typeof dto.merchant_uid !== 'string') {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'imp_uid와 merchant_uid는 필수입니다.',
          statusCode: 400,
        });
      }

      const result = await PurchaseCompleteService.completePurchase(userId, dto as PromptPurchaseCompleteRequestDTO);
      res.status(result.statusCode).json(result);
    } catch (err) {
      next(err);
    }
  },
};