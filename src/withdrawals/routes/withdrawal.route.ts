import { Router } from 'express';
import { WithdrawalController } from '../controllers/withdrawal.controller';
import { WithdrawalAvailableController } from '../controllers/withdrawal.available.controller';
import { authenticateJwt } from '../../config/passport';

const router = Router();

router.post('/withdrawals', authenticateJwt, WithdrawalController.requestWithdrawal);
router.get('/withdrawals/available', authenticateJwt, WithdrawalAvailableController.getAvailable);

export default router;