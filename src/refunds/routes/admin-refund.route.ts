import { Router } from 'express';
import { authenticateJwt } from '../../config/passport';
import { isAdmin } from '../../middlewares/isAdmin';
import {
  approveRefundHandler,
  completeManualRefundHandler,
  getPendingRefundListHandler,
  getRefundDetailHandler,
  getRefundListHandler,
  rejectRefundHandler,
} from '../controllers/admin-refund.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: AdminRefund
 *     description: 관리자 - 환불 신청 검토 (열람 후 환불, 최장 3개월)
 */

/**
 * @swagger
 * /api/admin/refunds/pending:
 *   get:
 *     summary: 검토 대기 환불 신청 목록
 *     description: status가 REQUESTED인 환불 신청만 조회합니다.
 *     tags: [AdminRefund]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: 조회 성공
 *       401: { description: 로그인 필요 }
 *       403: { description: 관리자 권한 필요 }
 */
router.get('/pending', authenticateJwt, isAdmin, getPendingRefundListHandler);

/**
 * @swagger
 * /api/admin/refunds:
 *   get:
 *     summary: 환불 전체 이력 조회
 *     description: |
 *       status로 필터링합니다. `APPROVED`는 담당자 승인 후 PG 결제 취소가 실패해
 *       수동 송금 처리가 필요한 건입니다.
 *     tags: [AdminRefund]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [REQUESTED, APPROVED, REJECTED, COMPLETED]
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200: { description: 조회 성공 }
 *       401: { description: 로그인 필요 }
 *       403: { description: 관리자 권한 필요 }
 */
router.get('/', authenticateJwt, isAdmin, getRefundListHandler);

/**
 * @swagger
 * /api/admin/refunds/{refundId}:
 *   get:
 *     summary: 환불 신청 상세 조회
 *     description: |
 *       담당자가 부실 여부를 판단할 수 있도록 프롬프트 본문(`prompt_detail.prompt`)과
 *       상세페이지 설명(`prompt_detail.description`), 지원 모델 목록을 함께 반환합니다.
 *     tags: [AdminRefund]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: refundId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 조회 성공 }
 *       404: { description: 환불 건 없음 }
 */
router.get('/:refundId', authenticateJwt, isAdmin, getRefundDetailHandler);

/**
 * @swagger
 * /api/admin/refunds/{refundId}/approve:
 *   patch:
 *     summary: 환불 신청 승인
 *     description: |
 *       상태를 APPROVED로 확정한 뒤 Payple 결제 취소를 호출합니다.
 *       - 취소 성공 → `status: COMPLETED`
 *       - 취소 실패(카드사 취소 가능 기간 초과 등) → `status: APPROVED` 유지 +
 *         `payple_cancel_failed: true`. 승인을 되돌리지 않으므로 계좌 송금 등으로
 *         수동 처리 후 `/complete-manual`을 호출해야 합니다.
 *     tags: [AdminRefund]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: refundId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 처리 완료 (payple_cancel_failed 확인 필요)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 refund_id: { type: integer }
 *                 status: { type: string, enum: [COMPLETED, APPROVED] }
 *                 payple_cancel_failed: { type: boolean }
 *                 payple_fail_code: { type: string, nullable: true }
 *                 statusCode: { type: integer, example: 200 }
 *       409: { description: 이미 처리된 환불 건 }
 *       404: { description: 환불 건 없음 }
 */
router.patch('/:refundId/approve', authenticateJwt, isAdmin, approveRefundHandler);

/**
 * @swagger
 * /api/admin/refunds/{refundId}/reject:
 *   patch:
 *     summary: 환불 신청 거절
 *     tags: [AdminRefund]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: refundId
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
 *               reason: { type: string, maxLength: 500, description: 거절 사유 }
 *     responses:
 *       200: { description: 거절 완료 }
 *       400: { description: 거절 사유 누락 }
 *       409: { description: 이미 처리된 환불 건 }
 */
router.patch('/:refundId/reject', authenticateJwt, isAdmin, rejectRefundHandler);

/**
 * @swagger
 * /api/admin/refunds/{refundId}/complete-manual:
 *   patch:
 *     summary: 수동 송금 완료 처리
 *     description: |
 *       PG 취소가 실패해 APPROVED에서 멈춘 건을 계좌 송금 등으로 처리한 뒤
 *       COMPLETED로 전이시킵니다. Payment/Settlement도 이 시점에 Refunded로 전이됩니다.
 *     tags: [AdminRefund]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: refundId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 완료 처리됨 }
 *       409: { description: APPROVED 상태가 아님 }
 */
router.patch('/:refundId/complete-manual', authenticateJwt, isAdmin, completeManualRefundHandler);

export default router;
