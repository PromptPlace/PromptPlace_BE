import express from "express";
import { signupController } from "../controllers/signup.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: SignUp
 *   description: 이메일 인증 기반 회원가입
 */

/**
 * @swagger
 * /api/auth/signup/send-code:
 *   post:
 *     summary: 이메일 인증번호 발송
 *     tags: [SignUp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: 인증번호 발송 성공
 */
router.post("/send-code", signupController.sendCode);

/**
 * @swagger
 * /api/auth/signup/verify-code:
 *   post:
 *     summary: 인증번호 확인
 *     tags: [SignUp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: 인증 성공
 */
router.post("/verify-code", signupController.verifyCode);

/**
 * @swagger
 * /api/auth/signup/register:
 *   post:
 *     summary: 회원가입 완료 (비밀번호 설정)
 *     tags: [SignUp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: 회원가입 성공
 */
router.post("/register", signupController.register);

export default router;