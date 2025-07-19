import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import googleLoginRouter from './social/google';
import naverLoginRouter from './social/naver';
import { authenticateJwt } from '../../config/passport';

const router = Router();

router.use('/login/google', googleLoginRouter);
router.use('/login/naver', naverLoginRouter);

router.get('/logout', authenticateJwt, AuthController.logout);

export default router; 