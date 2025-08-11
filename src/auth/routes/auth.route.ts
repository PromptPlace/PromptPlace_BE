import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import googleLoginRouter from "./social/google";
import naverLoginRouter from "./social/naver";
import kakaoLoginRouter from "./social/kakao";
import { authenticateJwt } from "../../config/passport";

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
router.use("/login/google", googleLoginRouter);

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
router.use("/login/naver", naverLoginRouter);

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
router.use("/login/kakao", kakaoLoginRouter);

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
router.post("/complete-signup", AuthController.completeSignup);

/**
 * @swagger
 * /api/auth/kakao/token:
 *   post:
 *     summary: 카카오 로그인 토큰 교환
 *     description: 프론트엔드에서 받은 카카오 인증코드로 JWT 토큰을 발급받습니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: 카카오 OAuth 인증코드
 *                 example: "abc123def456ghi789"
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
 *                       description: JWT 액세스 토큰 (3시간 유효)
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refresh_token:
 *                       type: string
 *                       description: JWT 리프레시 토큰 (14일 유효)
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           description: 사용자 고유 ID
 *                           example: 1
 *                         name:
 *                           type: string
 *                           description: 사용자 이름 (카카오는 제공하지 않아 빈 문자열)
 *                           example: ""
 *                         nickname:
 *                           type: string
 *                           description: 카카오 닉네임
 *                           example: "카카오닉네임"
 *                         email:
 *                           type: string
 *                           description: 카카오 계정 이메일
 *                           example: "user@kakao.com"
 *                         social_type:
 *                           type: string
 *                           description: 소셜 로그인 타입
 *                           example: "KAKAO"
 *                         status:
 *                           type: boolean
 *                           description: 계정 활성화 상태
 *                           example: true
 *                         role:
 *                           type: string
 *                           description: 사용자 역할
 *                           example: "USER"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           description: 계정 생성 시간
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                           description: 계정 정보 수정 시간
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: 잘못된 요청 데이터
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "BadRequest"
 *                 message:
 *                   type: string
 *                   example: "인증코드가 필요합니다."
 *                 statusCode:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 message:
 *                   type: string
 *                   example: "카카오 인증에 실패했습니다."
 *                 statusCode:
 *                   type: number
 *                   example: 401
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "InternalServerError"
 *                 message:
 *                   type: string
 *                   example: "알 수 없는 오류가 발생했습니다."
 *                 statusCode:
 *                   type: number
 *                   example: 500
 */
router.post("/kakao/token", AuthController.kakaoToken);

/**
 * @swagger
 * /api/auth/google/token:
 *   post:
 *     summary: 구글 로그인 토큰 교환
 *     description: 프론트엔드에서 받은 구글 인증코드로 JWT 토큰을 발급받습니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: 구글 OAuth 인증코드
 *                 example: "4/0AfJohXn..."
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
 *                       description: JWT 액세스 토큰 (3시간 유효)
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refresh_token:
 *                       type: string
 *                       description: JWT 리프레시 토큰 (14일 유효)
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           description: 사용자 고유 ID
 *                           example: 1
 *                         name:
 *                           type: string
 *                           description: 구글 계정 이름
 *                           example: "홍길동"
 *                         nickname:
 *                           type: string
 *                           description: 구글 계정 닉네임
 *                           example: "길동이"
 *                         email:
 *                           type: string
 *                           description: 구글 계정 이메일
 *                           example: "user@gmail.com"
 *                         social_type:
 *                           type: string
 *                           description: 소셜 로그인 타입
 *                           example: "GOOGLE"
 *                         status:
 *                           type: boolean
 *                           description: 계정 활성화 상태
 *                           example: true
 *                         role:
 *                           type: string
 *                           description: 사용자 역할
 *                           example: "USER"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           description: 계정 생성 시간
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                           description: 계정 정보 수정 시간
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: 잘못된 요청 데이터
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "BadRequest"
 *                 message:
 *                   type: string
 *                   example: "인증코드가 필요합니다."
 *                 statusCode:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 message:
 *                   type: string
 *                   example: "구글 인증에 실패했습니다."
 *                 statusCode:
 *                   type: number
 *                   example: 401
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "InternalServerError"
 *                 message:
 *                   type: string
 *                   example: "알 수 없는 오류가 발생했습니다."
 *                 statusCode:
 *                   type: number
 *                   example: 500
 */
router.post("/google/token", AuthController.googleToken);

/**
 * @swagger
 * /api/auth/naver/token:
 *   post:
 *     summary: 네이버 로그인 토큰 교환
 *     description: 프론트엔드에서 받은 네이버 인증코드로 JWT 토큰을 발급받습니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: 네이버 OAuth 인증코드
 *                 example: "abc123def456ghi789"
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
 *                       description: JWT 액세스 토큰 (3시간 유효)
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refresh_token:
 *                       type: string
 *                       description: JWT 리프레시 토큰 (14일 유효)
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           description: 사용자 고유 ID
 *                           example: 1
 *                         name:
 *                           type: string
 *                           description: 네이버 계정 이름
 *                           example: "홍길동"
 *                         nickname:
 *                           description: 네이버 계정 닉네임
 *                           example: "길동이"
 *                         email:
 *                           type: string
 *                           description: 네이버 계정 이메일
 *                           example: "user@naver.com"
 *                         social_type:
 *                           type: string
 *                           description: 소셜 로그인 타입
 *                           example: "NAVER"
 *                         status:
 *                           type: boolean
 *                           description: 계정 활성화 상태
 *                           example: true
 *                         role:
 *                           type: string
 *                           description: 사용자 역할
 *                           example: "USER"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           description: 계정 생성 시간
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                           description: 계정 정보 수정 시간
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: 잘못된 요청 데이터
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "BadRequest"
 *                 message:
 *                   type: string
 *                   example: "인증코드가 필요합니다."
 *                 statusCode:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 message:
 *                   type: string
 *                   example: "네이버 인증에 실패했습니다."
 *                 statusCode:
 *                   type: number
 *                   example: 401
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "InternalServerError"
 *                 message:
 *                   type: string
 *                   example: "알 수 없는 오류가 발생했습니다."
 *                 statusCode:
 *                   type: number
 *                   example: 500
 */
router.post("/naver/token", AuthController.naverToken);

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
router.get("/logout", authenticateJwt, AuthController.logout);

export default router;
