import { Request, Response } from 'express';
import { verifyAndSaveAccount} from '../services/settlement.service';
import { VerifyAccountDto } from '../dtos/settlement.dto';

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const user = req.user; 
    
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "로그인이 필요합니다.",
        statusCode: 401
      });
    }

    const dto: VerifyAccountDto = req.body;
    const userId = (req.user as { user_id: number }).user_id;
    const result = await verifyAndSaveAccount(userId, dto);

    return res.status(200).json({
      message: result.message,
      statusCode: 200
    });

  } catch (error: any) {
    const status = error.status || 500;
    const errorType = error.type || "InternalServerError";
    const message = error.message || "알 수 없는 오류가 발생했습니다.";

    return res.status(status).json({
      error: errorType,
      message: message,
      statusCode: status
    });
  }
};