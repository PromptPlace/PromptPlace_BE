import { Request, Response, NextFunction } from 'express';
import { WebhookService } from '../services/purchase.webhook.service';
import { PayplePaymentResult } from '../utils/payple';

export const WebhookController = {
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = req.body as Partial<PayplePaymentResult>;

      if (!result || typeof result.PCD_PAY_RST !== 'string') {
        return res.status(400).send('Invalid payload');
      }

      if (result.PCD_PAY_RST !== 'success') {
        console.log('[Webhook] Non-success result:', result.PCD_PAY_CODE, result.PCD_PAY_MSG);
        return res.status(200).send('OK');
      }

      await WebhookService.handlePaypleResult(result as PayplePaymentResult);
      res.status(200).send('OK');
    } catch (err) {
      console.error('[Webhook] Error:', err);
      res.status(500).send('Internal Server Error');
    }
  },
};
