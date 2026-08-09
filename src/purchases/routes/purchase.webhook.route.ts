import { Router } from 'express';
import express from 'express';
import { WebhookController, handlePaypleWebhook } from '../controller/purchase.webhook.controller';

const router = Router();

router.post(
  '/payple-result',
  express.urlencoded({ extended: true }),
  express.json(),
  WebhookController.handleWebhook
);

/**
 * @swagger
 * /api/prompts/purchases/payple-webhook:
 *   post:
 *     summary: Payple 결제결과 수신 webhook (가맹점 미수신 결과)
 *     description: |
 *       파트너 관리자 〉 기본정보에 등록한 결제결과 수신 URL. 브라우저가 결제창에서
 *       돌아오지 못한 결제를 서버-투-서버로 보완해 결제결과 누락을 방지한다.
 *
 *       PCD_RST_URL 겸용인 `/payple-result`와 달리 리다이렉트하지 않는다.
 *       (302를 수신 실패로 보고 재전송하는 것을 막기 위함)
 *
 *       멱등: 이미 처리된 결제면 아무것도 하지 않고 200. 처리 실패 시에만 500으로
 *       페이플 재전송을 유도한다. 취소완료 이벤트는 로그만 남기고 200.
 *     tags: [Purchase]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PCD_PAY_RST: { type: string, description: success / error / close }
 *               PCD_PAY_CODE: { type: string }
 *               PCD_PAY_MSG: { type: string }
 *               PCD_PAY_OID: { type: string }
 *               PCD_PAY_TOTAL: { type: string }
 *               PCD_PAY_REQKEY: { type: string }
 *               PCD_AUTH_KEY: { type: string }
 *               PCD_PAY_COFURL: { type: string, description: 웹훅 페이로드의 재검증 URL (PCD_PAY_URL은 빈 값) }
 *               PCD_USER_DEFINE1: { type: string, description: prompt_id / user_id / agreed_at JSON }
 *     responses:
 *       200:
 *         description: 처리 완료 또는 무시 (재전송 불필요)
 *       500:
 *         description: 처리 실패 — 페이플 재전송 필요
 */
router.post(
  '/payple-webhook',
  express.urlencoded({ extended: true }),
  express.json(),
  handlePaypleWebhook
);

export default router;
