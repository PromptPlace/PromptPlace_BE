import { Router } from 'express';
import { PurchaseCompleteController } from '../controller/purchase.complete.controller';
import { authenticateJwt } from '../../config/passport';
import { PurchaseRequestController } from '../controller/purchase.request.controller';
import { PurchaseHistoryController } from '../controller/purchase.controller';

const router = Router();

router.post('/requests', authenticateJwt, PurchaseRequestController.requestPurchase);
router.post('/complete', authenticateJwt, PurchaseCompleteController.completePurchase);
router.get('/', authenticateJwt, PurchaseHistoryController.list);

export default router;