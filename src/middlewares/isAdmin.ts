import { Request, Response, NextFunction } from "express";

//타입 확장은 모듈 레벨에서 처리
declare global {
  namespace Express {
    interface User {
      user_id: number;
      email: string;
      role: "ADMIN" | "USER";
    }

    interface Request {
      user?: User;
    }
  }
}

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // 1. 로그인 여부 확인
  if (!req.user) {
    return res.status(401).json({
      statusCode: 401,
      error: "Unauthorized",
      message: "로그인이 필요합니다.",
    });
  }

  // 2. 관리자 권한 확인
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      statusCode: 403,
      error: "Forbidden",
      message: "관리자 권한이 필요합니다.",
    });
  }

  next();
};
