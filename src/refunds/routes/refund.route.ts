import { Router } from 'express';
import { authenticateJwt } from '../../config/passport';
import {
  checkRefundEligibility,
  refundPurchaseHandler,
} from '../controllers/refund.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Refund
 *     description: 구매 환불 (7일 이내 미열람 자동 환불)
 */

/**
 * @swagger
 * /api/prompts/purchases/{purchaseId}/refund-eligibility:
 *   get:
 *     summary: 환불 가능 여부 조회
 *     description: |
 *       구매 건이 환불 가능한지 검증. 환불 가능 조건은 다음을 모두 만족:
 *       - 본인 구매
 *       - 유료 구매
 *       - 결제 상태 Succeed
 *       - 환불 이력 없음
 *       - 다운로드 이력 없음 (`Purchase.downloaded_at` 미값)
 *       - 구매 후 7일(168시간) 이내
 *     tags: [Refund]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: purchaseId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 조회 성공 (eligible true/false)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 eligible: { type: boolean }
 *                 reason:
 *                   type: string
 *                   enum: [EXPIRED_7DAYS, ALREADY_DOWNLOADED, ALREADY_REFUNDED, NOT_OWNER, NOT_PURCHASED, PAYMENT_NOT_SUCCEEDED, FREE_PURCHASE]
 *                   description: eligible=false일 때만 존재
 *                 remaining_seconds:
 *                   type: integer
 *                   description: eligible=true일 때 환불 가능 잔여 시간(초)
 *                 statusCode: { type: integer, example: 200 }
 *       401:
 *         description: 로그인 필요
 *       400:
 *         description: 잘못된 purchaseId
 */
router.get('/:purchaseId/refund-eligibility', authenticateJwt, checkRefundEligibility);

/**
 * @swagger
 * /api/prompts/purchases/{purchaseId}/refund:
 *   post:
 *     summary: 환불 실행
 *     description: |
 *       7일 이내 + 미열람 조건을 만족하면 Payple 결제 취소를 호출하고 DB(Refund/Payment/Settlement) 정합화.
 *       조건 미충족 시 400 RefundNotEligible.
 *     tags: [Refund]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: purchaseId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 환불 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 환불이 완료되었습니다. }
 *                 refund_id: { type: integer }
 *                 refunded_amount: { type: integer }
 *                 refunded_at: { type: string, format: date-time }
 *                 statusCode: { type: integer, example: 200 }
 *       400:
 *         description: 환불 불가 (RefundNotEligible)
 *       401:
 *         description: 로그인 필요
 *       404:
 *         description: 환불 대상 결제 정보를 찾을 수 없음
 *       502:
 *         description: Payple 환불 호출 실패 (PaypleRefundFailed)
 */
router.post('/:purchaseId/refund', authenticateJwt, refundPurchaseHandler);

export default router;
