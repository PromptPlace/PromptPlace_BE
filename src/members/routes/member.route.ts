import { Router } from 'express';
import { authenticateJwt } from '../../config/passport';
import MemberController from '../controllers/member.controller';

const router = Router();

// 회원 탈퇴
router.delete('/withdrawal', authenticateJwt, MemberController.withdraw);

export default router; 