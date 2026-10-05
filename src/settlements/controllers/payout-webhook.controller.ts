import { Request, Response } from 'express';
import { SettlementPayoutRepository } from '../repositories/settlement-payout.repository';
import { redactPaypleLog } from '../utils/payple';

// Payple 정산지급대행 이체 결과 webhook 수신 (#491 PR D).
// 원본 IP allowlist는 route middleware에서 먼저 검증한다.
// 본 컨트롤러는 group_key로 SettlementPayout을 찾아 status를 Succeed/Failed로 마감.
// 멱등성: 이미 Pending이 아니면 200으로 응답하고 변경 안 함.

export const handlePayoutWebhook = async (req: Request, res: Response) => {
  const body = req.body ?? {};
  const result = body.result as string | undefined;
  const cstId = body.cst_id as string | undefined;
  const groupKey = body.group_key as string | undefined;
  const billingTranId = body.billing_tran_id as string | undefined;
  const apiTranId = body.api_tran_id as string | undefined;
  const message = body.message as string | undefined;

  const expectedCstId = process.env.PAYPLE_CST_ID;
  if (!expectedCstId) {
    console.error('[payout-webhook] PAYPLE_CST_ID is not configured');
    return res.status(503).json({
      error: 'WebhookSecurityNotConfigured',
      statusCode: 503,
    });
  }
  if (!cstId || cstId !== expectedCstId) {
    console.warn('[payout-webhook] cst_id mismatch');
    return res.status(403).json({ error: 'Forbidden', statusCode: 403 });
  }

  if (!groupKey || !billingTranId) {
    console.error('[payout-webhook] missing required field', {
      body: redactPaypleLog(body),
    });
    return res.status(400).json({
      error: 'BadRequest',
      message: 'group_key 또는 billing_tran_id 누락',
      statusCode: 400,
    });
  }

  const payout = await SettlementPayoutRepository.findPayoutByGroupKey(groupKey);
  if (!payout) {
    // 멱등 — 이미 마감됐거나 매칭 없음. 200으로 응답해 Payple 재전송 방지.
    console.warn('[payout-webhook] no Pending payout for group_key', { groupKey });
    return res.status(200).json({ ok: true });
  }

  if (payout.billing_tran_id !== billingTranId) {
    console.warn('[payout-webhook] billing_tran_id mismatch', {
      payoutId: payout.payout_id,
    });
    return res.status(400).json({
      error: 'PayoutDataMismatch',
      statusCode: 400,
    });
  }

  if (result === 'A0000' && !apiTranId) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'api_tran_id 누락',
      statusCode: 400,
    });
  }

  try {
    if (result === 'A0000') {
      await SettlementPayoutRepository.markSucceeded(payout.payout_id, apiTranId ?? '');
      console.log('[payout-webhook] payout succeeded', { payoutId: payout.payout_id, apiTranId });
    } else {
      const reason = `Payple webhook ${result ?? 'UNKNOWN'} - ${message ?? ''}`;
      await SettlementPayoutRepository.markFailed(payout.payout_id, reason);
      console.error('[payout-webhook] payout failed', { payoutId: payout.payout_id, reason });
    }
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('[payout-webhook] update failed', { error: err?.message });
    return res.status(500).json({ error: 'InternalServerError', statusCode: 500 });
  }
};
