import { Request, Response } from 'express';
import { getRefundEligibility, refundPurchase } from '../services/refund.service';

const getUserId = (req: Request): number | null => {
  if (!req.user) return null;
  return (req.user as { user_id: number }).user_id;
};

const parsePurchaseId = (raw: string): number | null => {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
};

export const checkRefundEligibility = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized', message: '로그인이 필요합니다.', statusCode: 401 });
  }
  const purchaseId = parsePurchaseId(req.params.purchaseId);
  if (!purchaseId) {
    return res.status(400).json({ error: 'ValidationError', message: 'purchaseId가 올바르지 않습니다.', statusCode: 400 });
  }
  try {
    const result = await getRefundEligibility(userId, purchaseId);
    return res.status(200).json(result);
  } catch (error: any) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      error: error.error || 'InternalServerError',
      message: error.message || '서버 오류가 발생했습니다.',
      statusCode: status,
    });
  }
};

export const refundPurchaseHandler = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized', message: '로그인이 필요합니다.', statusCode: 401 });
  }
  const purchaseId = parsePurchaseId(req.params.purchaseId);
  if (!purchaseId) {
    return res.status(400).json({ error: 'ValidationError', message: 'purchaseId가 올바르지 않습니다.', statusCode: 400 });
  }
  try {
    const result = await refundPurchase(userId, purchaseId);
    return res.status(200).json(result);
  } catch (error: any) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      error: error.error || 'InternalServerError',
      message: error.message || '서버 오류가 발생했습니다.',
      statusCode: status,
    });
  }
};
