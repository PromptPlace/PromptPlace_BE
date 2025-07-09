import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    res.fail({
      statusCode: err.statusCode,
      error: err.error,
      message: err.message,
    });
  } else {
    res.fail({
      statusCode: 500,
      error: "InternalServerError",
      message: err.message || "알 수 없는 오류가 발생했습니다.",
    });
  }
};