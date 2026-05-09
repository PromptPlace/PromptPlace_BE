import { Request, Response, NextFunction } from 'express';
import { WebhookService } from '../services/purchase.webhook.service';
import { PayplePaymentResult } from '../utils/payple';

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
