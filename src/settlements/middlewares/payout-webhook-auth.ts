import { NextFunction, Request, Response } from 'express';
import { checkWebhookSourceIp } from '../utils/payout-webhook-security';

export const authorizePayoutWebhook = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const sourceIp = req.ip || req.socket.remoteAddress;
  const result = checkWebhookSourceIp(
    sourceIp,
    process.env.PAYPLE_PAYOUT_WEBHOOK_ALLOWED_IPS,
  );

  if (result === 'misconfigured') {
    console.error(
      '[payout-webhook] PAYPLE_PAYOUT_WEBHOOK_ALLOWED_IPS is missing or invalid',
    );
    return res.status(503).json({
      error: 'WebhookSecurityNotConfigured',
      message: '지급 웹훅 보안 설정이 완료되지 않았습니다.',
      statusCode: 503,
    });
  }

  if (result === 'denied') {
    console.warn('[payout-webhook] rejected source IP', { sourceIp });
    return res.status(403).json({
      error: 'Forbidden',
      message: '허용되지 않은 웹훅 요청입니다.',
      statusCode: 403,
    });
  }

  return next();
};
