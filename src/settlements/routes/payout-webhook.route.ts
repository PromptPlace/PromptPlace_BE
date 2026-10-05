import { Router } from 'express';
import { handlePayoutWebhook } from '../controllers/payout-webhook.controller';
import { authorizePayoutWebhook } from '../middlewares/payout-webhook-auth';

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
 *       PAYPLE_PAYOUT_WEBHOOK_ALLOWED_IPS에 등록된 Payple 원본 IP/CIDR만 허용하며,
 *       payload의 cst_id와 billing_tran_id도 서버 값과 교차 검증.
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
 *         description: 필수값 누락 또는 지급 데이터 불일치
 *       403:
 *         description: 허용되지 않은 원본 IP 또는 가맹점 ID
 *       503:
 *         description: 웹훅 IP allowlist 미설정/오설정
 *       500:
 *         description: 서버 오류
 */
router.post('/webhook', authorizePayoutWebhook, handlePayoutWebhook);

export default router;
