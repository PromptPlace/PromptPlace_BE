"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = require("../../config/passport");
const prompt_download_controller_1 = require("../controllers/prompt.download.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: PromptDownload
 *   description: 프롬프트 다운로드 / 상세 내용 조회 API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     PromptContent:
 *       type: object
 *       properties:
 *         prompt_id:
 *           type: integer
 *           example: 123
 *         title:
 *           type: string
 *           example: "챗GPT로 마케팅 자동화하기"
 *         content:
 *           type: string
 *           example: "당신은 마케팅 전문가입니다. 이 프롬프트는..."
 *         download_count:
 *           type: integer
 *           example: 42
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-07-29T10:00:00Z"
 */
/**
 * @swagger
 * /api/prompts/{promptId}/downloads:
 *   get:
 *     summary: 프롬프트 상세 내용 또는 다운로드
 *     description: 로그인한 사용자가 프롬프트 상세 내용을 확인하거나 다운로드합니다.
 *     tags: [PromptDownload]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: promptId
 *         required: true
 *         description: 조회할 프롬프트 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 프롬프트 내용 반환 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PromptContent'
 *       401:
 *         description: 인증이 필요합니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *                 message:
 *                   type: string
 *                   example: 로그인이 필요합니다.
 *                 statusCode:
 *                   type: number
 *                   example: 401
 *       404:
 *         description: 프롬프트를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/:promptId/downloads', passport_1.authenticateJwt, prompt_download_controller_1.PromptDownloadController.getPromptContent);
exports.default = router;
