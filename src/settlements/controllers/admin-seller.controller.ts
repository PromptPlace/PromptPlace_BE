import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/AppError';
import {
  approvePendingBusinessSeller,
  getPendingBusinessSellerDetail,
  listBusinessSellers,
  listIndividualSellers,
  listPendingBusinessSellers,
  rejectPendingBusinessSeller,
} from '../services/admin-seller.service';
import {
  ListPendingQueryDto,
  ListSellersQueryDto,
} from '../dtos/admin-seller.dto';

const parseUserIdParam = (raw: string): number => {
  const userId = Number(raw);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError(
      '유효하지 않은 사용자 ID입니다.',
      400,
      'ValidationError',
    );
  }
  return userId;
};

export const getPendingSellerList = async (
  req: Request<unknown, unknown, unknown, ListPendingQueryDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await listPendingBusinessSellers(
      req.query.page,
      req.query.limit,
    );
    return res.success(result, '승인 대기 사업자 판매자 목록을 조회했습니다.');
  } catch (error) {
    return next(error);
  }
};

export const getPendingSellerDetail = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = parseUserIdParam(req.params.userId);
    const result = await getPendingBusinessSellerDetail(userId);
    return res.success(result, '승인 대기 사업자 판매자 상세 정보를 조회했습니다.');
  } catch (error) {
    return next(error);
  }
};

export const approveSeller = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = parseUserIdParam(req.params.userId);
    await approvePendingBusinessSeller(userId);
    return res.success({ user_id: userId }, '사업자 판매자 등록을 승인했습니다.');
  } catch (error) {
    return next(error);
  }
};

export const rejectSeller = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = parseUserIdParam(req.params.userId);
    await rejectPendingBusinessSeller(userId);
    return res.success({ user_id: userId }, '사업자 판매자 등록을 반려했습니다.');
  } catch (error) {
    return next(error);
  }
};

export const getIndividualSellerList = async (
  req: Request<unknown, unknown, unknown, ListSellersQueryDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await listIndividualSellers(
      req.query.page,
      req.query.limit,
      req.query.search,
    );
    return res.success(result, '개인 판매자 목록을 조회했습니다.');
  } catch (error) {
    return next(error);
  }
};

export const getBusinessSellerList = async (
  req: Request<unknown, unknown, unknown, ListSellersQueryDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await listBusinessSellers(
      req.query.page,
      req.query.limit,
      req.query.search,
    );
    return res.success(result, '사업자 판매자 목록을 조회했습니다.');
  } catch (error) {
    return next(error);
  }
};
