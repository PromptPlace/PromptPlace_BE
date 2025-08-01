import { Request, Response } from 'express';
import AuthService from '../services/auth.service';
import { AppError } from '../../errors/AppError';

class AuthController {
  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        throw new AppError('구글 인증에 실패했습니다.', 401, 'Unauthorized');
      }
      
      if (user.status === false) {
        throw new AppError('비활성화된 계정입니다.', 403, 'Forbidden');
      }

      const { accessToken, refreshToken } = await AuthService.generateTokens(user);

      res.status(200).json({
        message: '구글 로그인이 완료되었습니다.',
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: {
            user_id: user.user_id,
            name: user.name,
            nickname: user.nickname,
            email: user.email,
            social_type: user.social_type,
            status: user.status ? 'ACTIVE' : 'INACTIVE',
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        },
        statusCode: 200,
      });

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.error, // .name -> .error
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        res.status(500).json({
          error: 'InternalServerError',
          message: '알 수 없는 오류가 발생했습니다.',
          statusCode: 500,
        });
      }
    }
  }

  async naverCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        throw new AppError('네이버 인증에 실패했습니다.', 401, 'Unauthorized');
      }
      
      if (user.status === false) {
        throw new AppError('비활성화된 계정입니다.', 403, 'Forbidden');
      }

      const { accessToken, refreshToken } = await AuthService.generateTokens(user);

      res.status(200).json({
        message: '네이버 로그인이 완료되었습니다.',
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: {
            user_id: user.user_id,
            name: user.name,
            nickname: user.nickname,
            email: user.email,
            social_type: user.social_type,
            status: user.status ? 'ACTIVE' : 'INACTIVE',
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        },
        statusCode: 200,
      });

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.error,
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        res.status(500).json({
          error: 'InternalServerError',
          message: '알 수 없는 오류가 발생했습니다.',
          statusCode: 500,
        });
      }
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // authenticateJwt 미들웨어가 정상적으로 통과하면 req.user에는 사용자 정보가 들어있음
      const user = req.user as any;
      
      await AuthService.logout(user.user_id);

      res.status(200).json({ 
        message: '로그아웃이 완료되었습니다.',
        statusCode: 200
      });
    } catch (error) {
      // 이 부분은 나중에 프로젝트 전역 에러 핸들러로 위임하는 것이 좋음
      res.status(500).json({
        error: 'InternalServerError',
        message: '알 수 없는 오류가 발생했습니다.',
        statusCode: 500,
      });
    }
  }
}

export default new AuthController(); 