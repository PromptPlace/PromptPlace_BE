import { Router } from 'express';
import express from 'express';
import { WebhookController } from '../controller/purchase.webhook.controller';

const router = Router();

router.post(
  '/payple-result',
  express.urlencoded({ extended: true }),
  express.json(),
  WebhookController.handleWebhook
);

export default router;
