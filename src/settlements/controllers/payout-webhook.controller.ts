import { Request, Response } from 'express';
import { SettlementPayoutRepository } from '../repositories/settlement-payout.repository';
import { redactPaypleLog } from '../utils/payple';

// Payple 정산지급대행 이체 결과 webhook 수신 (#491 PR D).
// 명세상 인증 방식 미명시 — 운영 전 IP allowlist 또는 shared-secret 별도 적용 권장.
// 본 컨트롤러는 group_key로 SettlementPayout을 찾아 status를 Succeed/Failed로 마감.
// 멱등성: 이미 Pending이 아니면 200으로 응답하고 변경 안 함.

export const handlePayoutWebhook = async (req: Request, res: Response) => {
  const body = req.body ?? {};
  const result = body.result as string | undefined;
  const groupKey = body.group_key as string | undefined;
  const apiTranId = body.api_tran_id as string | undefined;
  const message = body.message as string | undefined;

  if (!groupKey) {
    console.error('[payout-webhook] missing group_key', { body: redactPaypleLog(body) });
    return res.status(400).json({ error: 'BadRequest', message: 'group_key 누락', statusCode: 400 });
  }

  const payout = await SettlementPayoutRepository.findPayoutByGroupKey(groupKey);
  if (!payout) {
    // 멱등 — 이미 마감됐거나 매칭 없음. 200으로 응답해 Payple 재전송 방지.
    console.warn('[payout-webhook] no Pending payout for group_key', { groupKey });
    return res.status(200).json({ ok: true });
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
