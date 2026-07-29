import { Request, Response } from 'express';
import {
  approveRefund,
  completeManualRefund,
  getRefundDetail,
  listRefunds,
  rejectRefund,
} from '../services/admin-refund.service';
import { RefundStatusValue } from '../utils/refund-policy';

const VALID_STATUSES: RefundStatusValue[] = ['REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'];

const getAdminId = (req: Request): number => (req.user as { user_id: number }).user_id;

const parseRefundId = (raw: string): number | null => {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const fail = (res: Response, error: any) => {
  const status = error.statusCode || 500;
  return res.status(status).json({
    error: error.error || 'InternalServerError',
    message: error.message || '서버 오류가 발생했습니다.',
    statusCode: status,
  });
};

const badRefundId = (res: Response) =>
  res.status(400).json({
    error: 'ValidationError',
    message: 'refundId가 올바르지 않습니다.',
    statusCode: 400,
  });

export const getRefundListHandler = async (req: Request, res: Response) => {
  const rawStatus = req.query.status as string | undefined;
  if (rawStatus && !VALID_STATUSES.includes(rawStatus as RefundStatusValue)) {
    return res.status(400).json({
      error: 'ValidationError',
      message: `status는 ${VALID_STATUSES.join(', ')} 중 하나여야 합니다.`,
      statusCode: 400,
    });
  }

  try {
    const result = await listRefunds({
      status: rawStatus as RefundStatusValue | undefined,
      page: Number(req.query.page) || 1,
      size: Number(req.query.size) || 20,
    });
    return res.status(200).json(result);
  } catch (error: any) {
    return fail(res, error);
  }
};

// 검토 대기 목록 — 목록 핸들러에 status를 고정한 얇은 래퍼.
export const getPendingRefundListHandler = async (req: Request, res: Response) => {
  try {
    const result = await listRefunds({
      status: 'REQUESTED',
      page: Number(req.query.page) || 1,
      size: Number(req.query.size) || 20,
    });
    return res.status(200).json(result);
  } catch (error: any) {
    return fail(res, error);
  }
};

export const getRefundDetailHandler = async (req: Request, res: Response) => {
  const refundId = parseRefundId(req.params.refundId);
  if (!refundId) return badRefundId(res);
  try {
    return res.status(200).json(await getRefundDetail(refundId));
  } catch (error: any) {
    return fail(res, error);
  }
};

export const approveRefundHandler = async (req: Request, res: Response) => {
  const refundId = parseRefundId(req.params.refundId);
  if (!refundId) return badRefundId(res);
  try {
    return res.status(200).json(await approveRefund(refundId, getAdminId(req)));
  } catch (error: any) {
    return fail(res, error);
  }
};

export const rejectRefundHandler = async (req: Request, res: Response) => {
  const refundId = parseRefundId(req.params.refundId);
  if (!refundId) return badRefundId(res);
  try {
    return res.status(200).json(await rejectRefund(refundId, getAdminId(req), req.body?.reason));
  } catch (error: any) {
    return fail(res, error);
  }
};

export const completeManualRefundHandler = async (req: Request, res: Response) => {
  const refundId = parseRefundId(req.params.refundId);
  if (!refundId) return badRefundId(res);
  try {
    return res.status(200).json(await completeManualRefund(refundId, getAdminId(req)));
  } catch (error: any) {
    return fail(res, error);
  }
};
