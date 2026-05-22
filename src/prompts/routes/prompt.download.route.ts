import { Router } from 'express';
import { authenticateJwt } from '../../config/passport';
import { PromptDownloadController } from '../controllers/prompt.download.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: PromptDownload
 *   description: 프롬프트 다운로드 / 구매 목록 조회 API
 */

/**
 * @swagger
 * /api/prompts/{promptId}/downloads:
 *   get:
 *     summary: 프롬프트 상세 내용 다운로드
 *     description: |
 *       로그인한 사용자가 구매한(또는 무료) 프롬프트의 실제 본문을 조회합니다.
 *
 *       유료 프롬프트의 경우:
 *       - 결제 완료(`Payment.status='Succeed'`)된 본인 구매만 허용
 *       - 환불된 구매는 403 Refunded로 차단
 *       - 첫 다운로드 시점에 `Purchase.downloaded_at`을 기록 — 이후 환불 불가 (#485)
 *
 *       무료 프롬프트는 Purchase row가 없으면 자동 생성.
 *     tags: [PromptDownload]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: promptId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 다운로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 프롬프트 다운로드 완료 }
 *                 title: { type: string, example: "챗GPT 마케팅 자동화" }
 *                 prompt: { type: string, description: 프롬프트 본문 }
 *                 is_free: { type: boolean }
 *                 is_paid: { type: boolean }
 *                 statusCode: { type: integer, example: 200 }
 *       401:
 *         description: 로그인 필요
 *       403:
 *         description: 결제 미완료 또는 환불됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, description: "Forbidden | Refunded" }
 *                 message: { type: string }
 *                 statusCode: { type: integer, example: 403 }
 *             examples:
 *               notPaid:
 *                 summary: 유료 프롬프트 미결제
 *                 value: { error: Forbidden, message: 해당 프롬프트는 무료가 아니며, 결제가 완료되지 않았습니다., statusCode: 403 }
 *               refunded:
 *                 summary: 환불된 프롬프트 재다운로드 시도
 *                 value: { error: Refunded, message: 환불된 프롬프트는 다시 다운로드할 수 없습니다., statusCode: 403 }
 *       404:
 *         description: 프롬프트 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/:promptId/downloads', authenticateJwt, PromptDownloadController.getPromptContent);

/**
 * @swagger
 * /api/prompts/downloads:
 *   get:
 *     summary: 본인이 구매한 프롬프트 목록 조회
 *     description: 로그인한 사용자가 다운로드(구매)한 프롬프트 목록을 최신순으로 반환합니다. 무료/유료 모두 포함.
 *     tags: [PromptDownload]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 프롬프트 다운로드 목록 조회 성공 }
 *                 statusCode: { type: integer, example: 200 }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       prompt_id: { type: integer }
 *                       title: { type: string }
 *                       description: { type: string, nullable: true }
 *                       price: { type: integer }
 *                       models: { type: array, items: { type: string } }
 *                       imageUrls: { type: array, items: { type: string } }
 *                       has_review: { type: boolean }
 *                       is_recent_review: { type: boolean, description: 최근 30일 내 리뷰 작성 여부 }
 *                       userNickname: { type: string }
 *                       userProfileImageUrl: { type: string, nullable: true }
 *                       userReview:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           review_id: { type: integer }
 *                           content: { type: string }
 *                           rating: { type: number }
 *       401:
 *         description: 로그인 필요
 *       500:
 *         description: 서버 오류
 */
router.get('/downloads', authenticateJwt, PromptDownloadController.getDownloadedPrompts);

export default router;
