import { Request, Response, NextFunction } from "express";
import { RegisterAccountDto } from "../dtos/account.dto";
import { validateOrReject } from "class-validator";
import { AccountService } from "../services/account.service";

export const registerAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = new RegisterAccountDto();
    dto.bank_code = req.body.bank_code;
    dto.account_number = req.body.account_number;
    dto.account_holder = req.body.account_holder;

    // 유효성 검사
    await validateOrReject(dto);

    // 유저 인증 정보에서 ID 추출
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "로그인이 필요합니다.",
        statusCode: 401,
      });
    }

    const result = await AccountService.registerAccount(userId, dto);
    res.status(200).json(result);
  } catch (err: any) {
    next(err);
  }
};

export const getAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "로그인이 필요합니다.",
        statusCode: 401,
      });
    }

    const result = await AccountService.getAccountInfo(userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};