import { Router } from 'express';
import { authenticateJwt } from '../../config/passport';
import { PurchaseRequestController } from '../controller/purchase.request.controller';

const router = Router();

router.post('/requests', authenticateJwt, PurchaseRequestController.createPurchaseRequest);

export default router;