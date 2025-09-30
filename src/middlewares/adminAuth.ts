import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

/**
 * 관리자 권한을 확인하는 미들웨어.
 * authenticateJwt 미들웨어 실행 후 사용되어야 합니다.
 * req.user 객체에 role 속성이 'admin'인지 확인합니다.
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Passport를 통해 user 객체가 req에 adjtdlTek고 가정
  const user = (req as any).user;

  if (user && user.role === "admin") {
    return next();
  }

  // 관리자가 아닐 경우 403 Forbidden 에러 반환
  return next(new AppError("관리자 권한이 필요합니다.", 403, "Forbidden"));
};
