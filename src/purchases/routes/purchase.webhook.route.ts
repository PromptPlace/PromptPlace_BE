import { Router } from 'express';
import bodyParser from 'body-parser';
import { WebhookController } from '../controller/purchase.webhook.controller';

const router = Router();

router.post(
  '/portone-webhook',
  bodyParser.text({ type: 'application/json' }),
  WebhookController.handleWebhook
);

export default router;