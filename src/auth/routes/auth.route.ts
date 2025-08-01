import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import googleLoginRouter from './social/google';
import naverLoginRouter from './social/naver';
import { authenticateJwt } from '../../config/passport';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 및 로그인 관련 API
 */

/**
 * @swagger
 * /api/auth/login/google/callback:
 *   get:
 *     summary: 구글 로그인 콜백
 *     description: 구글 OAuth 인증 후 콜백 URL입니다. 클라이언트에서 이 URL로 자동 리디렉션됩니다.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 구글 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 구글 로그인이 완료되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         nickname:
 *                           type: string
 *                         email:
 *                           type: string
 *                         social_type:
 *                           type: string
 *                           example: google
 *                         status:
 *                           type: string
 *                           example: ACTIVE
 *                         role:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 비활성화된 계정
 */
router.use('/login/google', googleLoginRouter);

/**
 * @swagger
 * /api/auth/login/naver/callback:
 *   get:
 *     summary: 네이버 로그인 콜백
 *     description: 네이버 OAuth 인증 후 콜백 URL입니다.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 네이버 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 네이버 로그인이 완료되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         nickname:
 *                           type: string
 *                         email:
 *                           type: string
 *                         social_type:
 *                           type: string
 *                           example: naver
 *                         status:
 *                           type: string
 *                           example: ACTIVE
 *                         role:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 비활성화된 계정
 */
router.use('/login/naver', naverLoginRouter);

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: 로그아웃
 *     description: 현재 로그인된 사용자의 리프레시 토큰을 삭제합니다.
 *     tags: [Auth]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 로그아웃이 완료되었습니다.
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get('/logout', authenticateJwt, AuthController.logout);

export default router; 