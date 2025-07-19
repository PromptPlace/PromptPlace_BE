import { Router } from 'express';
import passport from 'passport';
import AuthController from '../../controllers/auth.controller';

const router = Router();

// GET /api/auth/login/naver
router.get('/', passport.authenticate('naver', { authType: 'reprompt', session: false }));

// GET /api/auth/login/naver/callback
router.get(
  '/callback',
  passport.authenticate('naver', { session: false }),
  AuthController.naverCallback
);

export default router; 