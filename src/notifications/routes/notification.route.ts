import express from 'express';
import { authenticateJwt } from '../../config/passport';
import { 
    toggleNotificationSubscription,
    getNotificationList,
    getPrompterNotificationStatus,
    getNotificationHasNewStatus
} from '../controllers/notification.controller';

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: 알림 관련 API
 */

/**
 * @swagger
 * /api/notifications/{prompterId}:
 *   post:
 *     summary: 프롬프터 알림 토글 (등록/취소)
 *     description: 이미 구독 중이면 취소, 아니면 등록합니다.
 *     tags: [Notifications]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: prompterId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 대상 프롬프터 ID
 *     responses:
 *       200:
 *         description: 알림 등록/취소 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 프롬프터 알림이 성공적으로 등록되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscribed:
 *                       type: boolean
 *                       example: true
 *                     user_id:
 *                       type: integer
 *                       example: 10
 *                     prompter_id:
 *                       type: integer
 *                       example: 3
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get('/me', authenticateJwt, getNotificationList); // 알림 목록 조회
/**
 * @swagger
 * /api/notifications/me:
 *   get:
 *     summary: 내 알림 목록 조회
 *     description: |
 *       커서 기반 페이지네이션(cursor-based-pagination) 사용.
 *       - `cursor`는 이전 요청에서 받은 마지막 데이터의 ID를 의미하며, 이를 기준으로 이후 데이터를 조회.
 *       - 첫 요청 시에는 `cursor`를 생략하여 최신 데이터부터 조회.
 *       - `has_more` 속성으로 더 불러올 데이터가 있는지 미리 확인 가능.
 *     tags: [Notifications]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: integer
 *         description: >
 *           마지막으로 조회된 ID.  
 *           처음 요청 시 생략 가능.  
 *           예: 첫 요청에서 id=80~70까지 받았다면 다음 요청 시 `cursor=70`
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 가져올 항목 수 (기본값 10)
 *     responses:
 *       200:
 *         description: 알림 목록을 성공적으로 불러왔습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 message: 내 알림 목록을 성공적으로 불러왔습니다.
 *                 data:
 *                   has_more: false
 *                   notifications:
 *                     - notification_id: 123
 *                       content: 프롬프트에 새로운 문의가 접수되었습니다.
 *                       created_at: "2025-07-06T18:10:00"
 *                       link_url: "/inquiries/10"
 *                     - notification_id: 122
 *                       content: 신고가 접수되었습니다.
 *                       created_at: "2025-07-06T18:10:00"
 *                       link_url: null
 *                     - notification_id: 121
 *                       content: 새로운 공지사항이 등록되었습니다
 *                       created_at: "2025-07-06T18:10:00"
 *                       link_url: "/announcements/12"
 *                     - notification_id: 120
 *                       content: "‘cindy’님이 회원님을 팔로우합니다."
 *                       created_at: "2025-07-06T18:10:00"
 *                       link_url: "/profile/15"
 *                     - notification_id: 119
 *                       content: "‘남아린’님이 새 프롬프트를 업로드하셨습니다."
 *                       created_at: "2025-07-06T18:10:00"
 *                       link_url: "/prompt/456"
 *                 status_code: 200
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */

router.post('/:prompterId', authenticateJwt, toggleNotificationSubscription); // 프롬프터 알림 설정, 취소
/**
 * @swagger
 * /api/notifications/status/{prompterId}:
 *   get:
 *     summary: 프롬프터 알림 설정 여부 조회
 *     description: |
 *       현재 로그인한 사용자가 특정 프롬프터를 알림 구독하고 있는지 조회합니다.
 *     tags: [Notifications]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: prompterId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 알림 설정 여부를 확인할 프롬프터 ID
 *     responses:
 *       200:
 *         description: 프롬프터 알림 설정 여부를 성공적으로 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 message: 프롬프터 알림 설정 여부를 성공적으로 조회했습니다.
 *                 data:
 *                   prompter_id: 2
 *                   user_id: 5
 *                   subscribed: true
 *                 statusCode: 200
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get('/status/:prompterId', authenticateJwt, getPrompterNotificationStatus); // 프롬프터 알림 설정 여부 조회

/**
 * @swagger
 * /api/notifications/status/has-new:
 *   get:
 *     summary: 새로운 알림 존재 여부 조회
 *     description: |
 *       사용자의 새로운 알림 존재 여부를 조회합니다.  
 *       `data.hasNew`가 `true`이면 새로운 알림이 존재함을 의미합니다.
 *     tags: [Notifications]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 사용자의 새 알림 상태를 성공적으로 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 message: 사용자의 새 알림 상태를 성공적으로 조회했습니다.
 *                 data:
 *                   hasNew: true
 *                 statusCode: 200
 *       401:
 *         description: 인증 실패 (JWT 토큰 누락 또는 만료)
 *       500:
 *         description: 서버 오류
 */
router.get('/status/has-new', authenticateJwt, getNotificationHasNewStatus); // 새로운 알림 존재 여부 조회
export default router;
