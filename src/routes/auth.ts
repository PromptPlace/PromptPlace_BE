import { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Google OAuth 로그인 시작
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth 콜백 처리
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        res.status(401).json({ message: '인증에 실패했습니다.' });
        return;
      }

      // JWT 토큰 생성 (user_id를 Int로 바로 사용)
      const token = jwt.sign(
        { id: user.user_id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // 성공 시 리다이렉트 (프론트엔드 URL로 변경 필요)
      res.redirect(`/auth/success?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('/auth/error');
    }
  }
);

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