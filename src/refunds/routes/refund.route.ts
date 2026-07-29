import { Router } from 'express';
import { authenticateJwt } from '../../config/passport';
import {
  checkRefundEligibility,
  refundPurchaseHandler,
  requestManualRefundHandler,
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
 *       - 구매 후 7일 이내 — **KST 날짜 기준, 첫날 제외.** 7/23 구매 시 7/30 23:59:59까지
 *
 *       이미 열람한 건은 `manual_refund_available`로 수동 환불 신청 가능 여부를 확인하세요.
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
 *                   enum: [EXPIRED_7DAYS, EXPIRED_3MONTHS, ALREADY_DOWNLOADED, NOT_DOWNLOADED, ALREADY_REFUNDED, REFUND_IN_REVIEW, REFUND_REJECTED, NOT_OWNER, NOT_PURCHASED, PAYMENT_NOT_SUCCEEDED, FREE_PURCHASE]
 *                   description: eligible=false일 때만 존재
 *                 remaining_seconds:
 *                   type: integer
 *                   description: eligible=true일 때 환불 가능 잔여 시간(초)
 *                 refund_deadline:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   description: 자동 환불 마감 시각 (KST 기준 D+7 종료)
 *                 manual_refund_available:
 *                   type: boolean
 *                   description: 열람 후 수동 환불 신청 가능 여부 (구매 후 3개월 이내)
 *                 manual_refund_deadline:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
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

/**
 * @swagger
 * /api/prompts/purchases/{purchaseId}/refund-request:
 *   post:
 *     summary: 수동 환불 신청 (열람 후)
 *     description: |
 *       이미 열람한 프롬프트의 환불을 신청합니다. 단순 변심은 불가하며,
 *       담당자가 아래 사유에 해당하는지 확인 후 승인/거절합니다.
 *       - 본문이 비어 있거나 의미 있는 지시문이라 볼 수 없는 경우
 *       - 본문 분량·구성이 상세페이지 안내 수준에 현저히 미달하는 경우
 *       - 명시된 AI 모델에서 실행해도 상세페이지 예시와 같은 범주의 결과물을 얻을 수 없는 경우
 *       - 작성자가 직접 작성하지 않고 외부에서 가져온 경우
 *
 *       신청 가능 조건: 열람함(`downloaded_at` 있음) + 구매 후 3개월 이내 + 기존 환불 이력 없음.
 *       아직 열람하지 않았고 7일이 지나지 않았다면 검토 없이 즉시 환불되므로
 *       `POST /refund`를 사용해야 하며, 이 경우 400 `UseAutoRefund`를 반환합니다.
 *     tags: [Refund]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: purchaseId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 description: 환불 신청 사유
 *     responses:
 *       200:
 *         description: 신청 접수 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 refund_id: { type: integer }
 *                 status: { type: string, example: REQUESTED }
 *                 requested_at: { type: string, format: date-time }
 *                 statusCode: { type: integer, example: 200 }
 *       400:
 *         description: 신청 불가 (RefundNotEligible / UseAutoRefund / ValidationError)
 *       401:
 *         description: 로그인 필요
 *       404:
 *         description: 환불 대상 결제 정보를 찾을 수 없음
 */
router.post('/:purchaseId/refund-request', authenticateJwt, requestManualRefundHandler);

export default router;
