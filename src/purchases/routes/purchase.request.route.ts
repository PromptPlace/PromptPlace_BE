import { Router } from 'express';
import { PurchaseCompleteController } from '../controller/purchase.complete.controller';
import { authenticateJwt } from '../../config/passport';
import { PurchaseRequestController } from '../controller/purchase.request.controller';

const router = Router();

router.post('/requests', authenticateJwt, PurchaseRequestController.requestPurchase);
router.post('/complete', authenticateJwt, PurchaseCompleteController.completePurchase);

export default router;