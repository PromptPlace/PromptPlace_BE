import { Router } from 'express';
import { handlePayoutWebhook } from '../controllers/payout-webhook.controller';

const router = Router();

/**
 * @swagger
 * /api/payouts/webhook:
 *   post:
 *     summary: Payple 정산지급대행 이체 결과 webhook 수신
 *     description: |
 *       executePayout(NOW) 요청 시 첨부한 webhook_url로 Payple이 이체 결과를 전송.
 *       group_key로 SettlementPayout을 찾아 status를 Succeed/Failed로 마감.
 *       멱등: 이미 Pending이 아니면 200 OK 응답만 (재전송 방지).
 *
 *       운영 전 IP allowlist 또는 shared-secret 인증 별도 적용 권장 (Payple 명세 미명시).
 *     tags: [Settlement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               result: { type: string, description: A0000 성공 / 그 외 실패 }
 *               message: { type: string }
 *               group_key: { type: string }
 *               billing_tran_id: { type: string }
 *               api_tran_id: { type: string }
 *               tran_amt: { type: string }
 *     responses:
 *       200:
 *         description: 멱등 처리 완료
 *       400:
 *         description: group_key 누락
 *       500:
 *         description: 서버 오류
 */
router.post('/webhook', handlePayoutWebhook);

export default router;
