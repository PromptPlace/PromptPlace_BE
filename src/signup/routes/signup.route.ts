import express from "express";
import { signupController } from "../controllers/signup.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 * name: SignUp
 * description: 이메일 인증 기반 회원가입
 */

/**
 * @swagger
 * /api/auth/signup/send-code:
 * post:
 * summary: 이메일 인증번호 발송
 * tags: [SignUp]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * responses:
 * 200:
 * description: 인증번호 발송 성공
 */
router.post("/send-code", signupController.sendCode);

/**
 * @swagger
 * /api/auth/signup/verify-code:
 * post:
 * summary: 인증번호 확인 및 임시 토큰 발급
 * tags: [SignUp]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * code:
 * type: string
 * responses:
 * 200:
 * description: 인증 성공 및 임시 토큰 발급
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * tempToken:
 * type: string
 * description: 약관 동의 및 최종 회원가입에 사용되는 임시 토큰
 */
router.post("/verify-code", signupController.verifyCode);

/**
 * @swagger
 * /api/auth/signup/register:
 * post:
 * summary: 약관 동의 및 최종 회원가입
 * tags: [SignUp]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * password:
 * type: string
 * format: password
 * tempToken:
 * type: string
 * description: verify-code 응답으로 받은 임시 토큰
 * consents:
 * type: array
 * description: 약관 동의 내역 (필수/선택)
 * items:
 * type: object
 * properties:
 * type:
 * type: string
 * isAgreed:
 * type: boolean
 * responses:
 * 201:
 * description: 회원가입 성공
 */
router.post("/register", signupController.register);

export default router;