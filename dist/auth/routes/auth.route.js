"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const google_1 = __importDefault(require("./social/google"));
const naver_1 = __importDefault(require("./social/naver"));
const kakao_1 = __importDefault(require("./social/kakao"));
const passport_1 = require("../../config/passport");
const router = (0, express_1.Router)();
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
router.use("/login/google", google_1.default);
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
router.use("/login/naver", naver_1.default);
/**
 * @swagger
 * /api/auth/login/kakao/callback:
 *   get:
 *     summary: 카카오 로그인 콜백
 *     description: 카카오 OAuth 인증 후 콜백 URL입니다. 클라이언트에서 이 URL로 자동 리디렉션됩니다.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 카카오 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 카카오 로그인이 완료되었습니다.
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
 *                           example: kakao
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
router.use("/login/kakao", kakao_1.default);
/**
 * @swagger
 * /api/auth/complete-signup:
 *   post:
 *     summary: 회원가입 완료
 *     description: 소셜 로그인 후 추가 정보를 입력하여 회원가입을 완료합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - nickname
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: 홍길동
 *               nickname:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: 길동이
 *               description:
 *                 type: string
 *                 maxLength: 255
 *                 example: 안녕하세요! 프롬프트 제작자입니다.
 *               sns_url:
 *                 type: string
 *                 maxLength: 100
 *                 example: https://instagram.com/username
 *     responses:
 *       200:
 *         description: 회원가입 완료 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 회원가입이 완료되었습니다.
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
 *                         status:
 *                           type: string
 *                         role:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: 잘못된 요청 데이터
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post("/complete-signup", auth_controller_1.default.completeSignup);
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
router.get("/logout", passport_1.authenticateJwt, auth_controller_1.default.logout);
exports.default = router;
