import { Router } from 'express';
import { WithdrawalController } from '../controllers/withdrawal.controller';
import { authenticateJwt } from '../../config/passport';

const router = Router();

router.post('/withdrawals', authenticateJwt, WithdrawalController.requestWithdrawal);

export default router;