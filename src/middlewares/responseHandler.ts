import { Request, Response, NextFunction } from "express";

export const responseHandler = (req: Request, res: Response, next: NextFunction) => {
  res.success = (data: any, message = "요청이 성공적으로 처리되었습니다.") => {
    return res.status(200).json({
      message,
      data,
      statusCode: 200,
    });
  };

  res.fail = ({
    statusCode = 500,
    error = "InternalServerError",
    message = "알 수 없는 오류가 발생했습니다.",
  }) => {
    return res.status(statusCode).json({
      error,
      message,
      statusCode,
    });
  };

  next();
};

// 타입 확장 (global.d.ts)
declare global {
  namespace Express {
    interface Response {
      success: (data: any, message?: string) => Response; // data 파라미터 다시 필수(any)로 변경
      fail: (options: {
        statusCode?: number;
        error?: string;
        message?: string;
      }) => Response;
    }
  }
}