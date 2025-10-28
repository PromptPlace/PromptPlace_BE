import express from "express";
import { signinController } from "../controllers/signin.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 * name: SignIn
 * description: 이메일/비밀번호 로그인 및 초기 설정
 */

/**
 * @swagger
 * /api/auth/signin:
 * post:
 * summary: 이메일과 비밀번호를 이용한 로그인
 * tags: [SignIn]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * example: user@example.com
 * password:
 * type: string
 * format: password
 * example: securePassword123!
 * responses:
 * 200:
 * description: 로그인 성공 및 토큰 발급
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: 로그인 성공
 * data:
 * type: object
 * properties:
 * accessToken:
 * type: string
 * refreshToken:
 * type: string
 * user:
 * type: object
 * properties:
 * user_id:
 * type: integer
 * email:
 * type: string
 * role:
 * type: string
 * isInitialSetupRequired:
 * type: boolean
 * description: 최초 설정(닉네임, 소개글)이 필요한지 여부
 * 401:
 * description: 인증 실패 (비밀번호 불일치, 계정 비활성화 등)
 */
router.post("/", signinController.login);

/**
 * @swagger
 * /api/auth/signin/initial-setup:
 * post:
 * security:
 * - bearerAuth: [] # JWT 토큰을 통한 인증 필요
 * summary: 최초 로그인 시 닉네임과 소개글 설정
 * tags: [SignIn]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * nickname:
 * type: string
 * description: 사용자가 설정할 닉네임
 * example: PromptMaster_99
 * intro:
 * type: string
 * description: 사용자가 설정할 소개글
 * example: AI 프롬프트에 관심 많은 개발자입니다.
 * responses:
 * 200:
 * description: 초기 설정 완료 및 업데이트된 사용자 정보 반환
 * 400:
 * description: 닉네임 중복 또는 이미 설정이 완료된 사용자
 * 401:
 * description: 인증되지 않은 사용자
 */
// router.post("/initial-setup", authenticate, signinController.initialSetup); // 'authenticate' 미들웨어 가정
router.post("/initial-setup", signinController.initialSetup); // 미들웨어 적용 없이 일단 라우트만 설정

export default router;