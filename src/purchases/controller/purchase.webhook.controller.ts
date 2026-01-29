import { Request, Response, NextFunction } from 'express';
import * as PortOne from '@portone/server-sdk';
import { WebhookService } from '../services/purchase.webhook.service';

export const WebhookController = {
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const webhookSecret = process.env.PORTONE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('PORTONE_WEBHOOK_SECRET is not set');
        return res.status(500).send('Server Config Error');
      }

      // 1. 웹훅 서명 검증
      const webhook = await PortOne.Webhook.verify(
        webhookSecret,
        req.body,
        req.headers as Record<string, string | string[] | undefined>
      );

      // 2. 이벤트 타입별 처리 -> 현재는 결제 완료(Paid)만 처리
      if (webhook.type === 'Transaction.Paid') {
        const { paymentId, storeId } = webhook.data;
        await WebhookService.handleTransactionPaid(paymentId, storeId);
      } else if (webhook.type === 'Transaction.Cancelled') {
        console.log('[Webhook] Transaction Cancelled:', webhook.data.paymentId);
      }
      res.status(200).send('OK');
    } catch (err) {
      if (err instanceof PortOne.Webhook.WebhookVerificationError) {
        console.error('[Webhook] Signature Verification Failed');
        return res.status(400).send('Verification Failed');
      }
      console.error('[Webhook] Error:', err);
      res.status(500).send('Internal Server Error');
    }
  }
};