import express from 'express';
import { authenticateJwt } from '../../config/passport';
import { 
    toggleNotificationSubscription,
    getNotificationList,
} from '../controllers/notification.controller';

const router = express.Router();

router.get('/me', authenticateJwt, getNotificationList); // 알림 목록 조회
router.post('/:prompterId', authenticateJwt, toggleNotificationSubscription); // 프롬프터 알림 설정, 취소

export default router;