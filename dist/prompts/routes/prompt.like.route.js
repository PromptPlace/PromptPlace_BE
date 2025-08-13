"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = require("../../config/passport");
const prompt_like_controller_1 = require("../controllers/prompt.like.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: PromptLike
 *   description: 프롬프트 찜 관련 API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     PromptModel:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *     PromptTag:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *     Prompt:
 *       type: object
 *       properties:
 *         prompt_id:
 *           type: integer
 *         title:
 *           type: string
 *         models:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               model:
 *                 $ref: '#/components/schemas/PromptModel'
 *         tags:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               tag:
 *                 $ref: '#/components/schemas/PromptTag'
 */
/**
 * @swagger
 * /api/prompts/{promptId}/likes:
 *   post:
 *     summary: 프롬프트 찜하기
 *     description: 현재 로그인한 사용자가 특정 프롬프트를 찜합니다.
 *     tags: [PromptLike]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: promptId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 찜할 프롬프트 ID
 *     responses:
 *       201:
 *         description: 프롬프트 찜 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *       401:
 *         description: 인증이 필요합니다
 *       409:
 *         description: 이미 찜한 프롬프트
 *       404:
 *         description: 프롬프트를 찾을 수 없음
 */
router.post('/:promptId/likes', passport_1.authenticateJwt, prompt_like_controller_1.likePrompt);
/**
 * @swagger
 * /api/prompts/likes:
 *   get:
 *     summary: 찜한 프롬프트 목록 조회
 *     description: 로그인한 사용자가 찜한 프롬프트 목록을 조회합니다.
 *     tags: [PromptLike]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 찜한 프롬프트 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Prompt'
 *                 message:
 *                   type: string
 *       401:
 *         description: 인증이 필요합니다
 */
router.get('/likes', passport_1.authenticateJwt, prompt_like_controller_1.getLikedPrompts);
/**
 * @swagger
 * /api/prompts/{promptId}/likes:
 *   delete:
 *     summary: 프롬프트 찜 취소
 *     description: 로그인한 사용자가 특정 프롬프트에 대한 찜을 취소합니다.
 *     tags: [PromptLike]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: promptId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 찜을 취소할 프롬프트 ID
 *     responses:
 *       200:
 *         description: 프롬프트 찜 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: 인증이 필요합니다
 *       404:
 *         description: 찜 기록 없음
 */
router.delete('/:promptId/likes', passport_1.authenticateJwt, prompt_like_controller_1.unlikePrompt);
exports.default = router;
