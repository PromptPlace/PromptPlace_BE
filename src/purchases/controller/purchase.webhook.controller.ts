import { Request, Response, NextFunction } from 'express';
import { WebhookService } from '../services/purchase.webhook.service';
import { PayplePaymentResult } from '../utils/payple';
import { redactPaypleLog } from '../../settlements/utils/payple';

type RedirectStatus = 'success' | 'fail' | 'error' | 'invalid';

const buildRedirectUrl = (
  status: RedirectStatus,
  params: Record<string, string | undefined>,
): string | null => {
  const base = process.env.PURCHASE_RESULT_REDIRECT_URL;
  if (!base) return null;

  try {
    const url = new URL(base);
    url.searchParams.set('status', status);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') url.searchParams.set(key, value);
    });
    return url.toString();
  } catch {
    return null;
  }
};

export const WebhookController = {
  async handleWebhook(req: Request, res: Response, _next: NextFunction) {
    const result = req.body as Partial<PayplePaymentResult> | undefined;
    const oid = typeof result?.PCD_PAY_OID === 'string' ? result.PCD_PAY_OID : undefined;

    const redirect = (
      status: RedirectStatus,
      params: Record<string, string | undefined> = {},
    ) => {
      const url = buildRedirectUrl(status, { oid, ...params });
      if (url) return res.redirect(302, url);
      return res.status(200).send('OK');
    };

    if (!result || typeof result.PCD_PAY_RST !== 'string') {
      return redirect('invalid');
    }

    if (result.PCD_PAY_RST !== 'success') {
      console.log('[Webhook] Non-success result:', result.PCD_PAY_CODE, result.PCD_PAY_MSG);
      return redirect('fail', {
        code: result.PCD_PAY_CODE,
        message: result.PCD_PAY_MSG,
      });
    }

    try {
      await WebhookService.handlePaypleResult(result as PayplePaymentResult);
      return redirect('success');
    } catch (err) {
      console.error('[Webhook] Error:', err);
      return redirect('error');
    }
  },
};

// 페이플 파트너 관리자에 등록한 결제결과 수신 웹훅.
// PCD_RST_URL 겸용인 handleWebhook과 달리 절대 리다이렉트하지 않는다 —
// 페이플은 302를 수신 실패로 보고 재전송하므로 성공/무시 모두 200이어야 한다.
// 실패 시에만 500을 반환해 페이플 재전송을 유도한다 (payout-webhook과 동일 규약).
export const handlePaypleWebhook = async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as Partial<PayplePaymentResult> & { PCD_REFUND_TOTAL?: string };

  if (typeof body.PCD_PAY_RST !== 'string') {
    console.warn('[payple-webhook] 알 수 없는 페이로드', { body: redactPaypleLog(body) });
    return res.status(200).send('OK');
  }

  // 취소완료 이벤트도 같은 URL로 들어오지만 PCD_USER_DEFINE1(prompt_id/user_id)이 없어
  // 결제 처리 로직을 태울 수 없다. 환불 정본은 admin-refund 워크플로(#533)이므로 기록만 남긴다.
  if (body.PCD_REFUND_TOTAL !== undefined) {
    console.log('[payple-webhook] 취소 이벤트 수신 (처리 안 함)', {
      oid: body.PCD_PAY_OID,
      code: body.PCD_PAY_CODE,
      refundTotal: body.PCD_REFUND_TOTAL,
    });
    return res.status(200).send('OK');
  }

  if (body.PCD_PAY_RST !== 'success') {
    console.log('[payple-webhook] 비성공 결과', {
      oid: body.PCD_PAY_OID,
      code: body.PCD_PAY_CODE,
      msg: body.PCD_PAY_MSG,
    });
    return res.status(200).send('OK');
  }

  try {
    // 멱등성은 handlePaypleResult의 findExistingPurchase가 보장한다.
    // /complete와 웹훅이 동시에 도착해도 구매가 중복 생성되지 않는다.
    await WebhookService.handlePaypleResult(body as PayplePaymentResult);
    return res.status(200).send('OK');
  } catch (err: any) {
    console.error('[payple-webhook] 처리 실패 — 재전송 대기', {
      oid: body.PCD_PAY_OID,
      error: err?.message,
    });
    return res.status(500).send('ERROR');
  }
};
