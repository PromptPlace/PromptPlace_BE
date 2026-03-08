import { Request, Response } from 'express';
import { registerIndividualSeller } from '../services/settlement.seller.service';

export const registerIndividual = async (req: Request, res: Response) => {
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
    const result = await registerIndividualSeller(userId, req.body);

    return res.status(200).json({
      message: result.message,
      statusCode: 200,
    });

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'ValidationError',
        message: error.message,
        statusCode: 400,
      });
    }
    
    if (error.name === 'AlreadyRegistered') {
      return res.status(409).json({
        error: 'AlreadyRegistered',
        message: error.message,
        statusCode: 409,
      });
    }

    return res.status(500).json({
      error: 'InternalServerError',
      message: '서버 오류가 발생했습니다.',
      statusCode: 500,
    });
  }
};