import { Request, Response } from 'express';
import { verifySellerAccount, getAccountInfo } from '../services/settlement.account.service';
import { VerifyAccountRequestDto, ViewAccountResponseDto } from '../dtos/settlement.dto';

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '로그인이 필요합니다.',
        statusCode: 401,
      });
    }

    const dto: VerifyAccountRequestDto = req.body;
    const userId = (req.user as { user_id: number }).user_id;
    const result = await verifySellerAccount(userId, dto);

    return res.status(200).json({
      message: result.message,
      registerToken: result.registerToken,
      expiresIn: result.expiresIn,
      statusCode: 200,
    });
  } catch (error: any) {
    if (error.name === 'AccountVerificationError' || error?.name === 'AccountVerificationError') {
      return res.status(400).json({
        error: 'AccountVerificationError',
        subCode: error.subCode,
        message: error.message,
        statusCode: 400,
      });
    }
    if (error.error === 'ValidationError' || error?.name === 'ValidationError') {
      return res.status(400).json({
        error: 'ValidationError',
        message: error.message,
        statusCode: 400,
      });
    }
    if (error.error === 'InvalidAccountInfo') {
      return res.status(400).json({
        error: 'InvalidAccountInfo',
        message: error.message,
        statusCode: 400,
      });
    }
    const status = error.statusCode || 500;
    return res.status(status).json({
      error: error.error || 'InternalServerError',
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      statusCode: status,
    });
  }
};

export const ViewAccount = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '로그인이 필요합니다.',
        statusCode: 401,
      });
    }

    const userId = (req.user as { user_id: number }).user_id;

    const accountData = await getAccountInfo(userId);

    const response: ViewAccountResponseDto = {
      message: '계좌 정보 조회가 완료되었습니다.',
      data: accountData,
      statusCode: 200,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    const status = error.statusCode || 500;
    const errorType = error.code || 'InternalServerError';
    const message = error.message || '알 수 없는 오류가 발생했습니다.';

    return res.status(status).json({
      error: errorType,
      message,
      statusCode: status,
    });
  }
};
