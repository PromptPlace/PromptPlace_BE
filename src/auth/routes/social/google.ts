import { Router } from 'express';
import passport from 'passport';
import AuthController from '../../controllers/auth.controller';

const router = Router();

// GET /api/auth/login/google
router.get('/', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// GET /api/auth/login/google/callback
router.get(
  '/callback',
  passport.authenticate('google', { session: false }),
  AuthController.googleCallback
);

export default router; 