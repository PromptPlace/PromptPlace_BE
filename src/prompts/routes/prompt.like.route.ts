import { Router } from 'express';
import { authenticateJwt } from '../../config/passport';
import { likePrompt, getLikedPrompts, unlikePrompt } from '../controllers/prompt.like.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: PromptLike
 *   description: 프롬프트 찜 관련 API
 */

/**
 * @swagger
 * /api/prompts/{promptId}/likes:
 *   post:
 *     summary: 프롬프트를 찜합니다.
 *     description: 현재 로그인한 사용자가 특정 프롬프트를 찜합니다.
 *     tags: [PromptLike]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - name: promptId
 *         in: path
 *         required: true
 *         description: 찜할 프롬프트 ID
 *         schema:
 *           type: integer
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
 *       500:
 *         description: 서버 오류
 */
router.post('/:promptId/likes', authenticateJwt, likePrompt);
/**
 * @swagger
 * /api/prompts/likes:
 *   get:
 *     summary: 찜한 프롬프트 목록 조회
 *     description: 로그인한 사용자가 찜한 프롬프트들을 조회합니다.
 *     tags: [PromptLike]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 찜한 프롬프트 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *       401:
 *         description: 인증이 필요합니다
 *       500:
 *         description: 서버 오류
 */
router.get('/likes', authenticateJwt, getLikedPrompts);
/**
 * @swagger
 * /api/prompts/{promptId}/likes:
 *   delete:
 *     summary: 프롬프트 찜 취소
 *     description: 로그인한 사용자가 특정 프롬프트 찜을 취소합니다.
 *     tags: [PromptLike]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - name: promptId
 *         in: path
 *         required: true
 *         description: 찜을 취소할 프롬프트 ID
 *         schema:
 *           type: integer
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
 *       500:
 *         description: 서버 오류
 */
router.delete('/:promptId/likes', authenticateJwt, unlikePrompt);

export default router;