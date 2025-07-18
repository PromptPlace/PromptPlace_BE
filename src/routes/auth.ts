import { Router, Request, Response } from 'express';
import googleAuthRouter from './auth/google';
import naverAuthRouter from './auth/naver';
import prisma from '../config/prisma';
import { authenticateJwt } from '../config/passport';

const router = Router();

// 소셜 로그인 라우터
router.use('/google', googleAuthRouter);
router.use('/naver', naverAuthRouter);

// 로그인 성공 페이지 (토큰 전달용)
router.get('/success', (req: Request, res: Response) => {
  const token = req.query.token as string;
  if (token) {
    res.json({ 
      success: true, 
      message: '로그인 성공',
      token: token 
    });
  } else {
    res.status(400).json({ 
      success: false, 
      message: '토큰이 없습니다.' 
    });
  }
});

// 로그인 에러 페이지
router.get('/error', (req: Request, res: Response) => {
  res.status(401).json({ 
    success: false, 
    message: '로그인에 실패했습니다.' 
  });
});

// 로그아웃
router.post('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: '로그아웃 중 오류가 발생했습니다.' });
    }
    res.json({ message: '로그아웃되었습니다.' });
  });
});

// 현재 사용자 정보 조회
router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
      return;
    }

    const userInfo = await prisma.user.findUnique({
      where: { user_id: user.user_id },
      select: {
        user_id: true,
        name: true,
        nickname: true,
        email: true,
        social_type: true,
        role: true,
        created_at: true
      }
    });

    res.json({ user: userInfo });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ message: '사용자 정보 조회 중 오류가 발생했습니다.' });
  }
});

export default router; 