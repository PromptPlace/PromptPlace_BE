import { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = Router();

// Google OAuth 로그인 시작
router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth 콜백 처리
router.get('/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        res.status(401).json({ message: '인증에 실패했습니다.' });
        return;
      }

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

export default router; 