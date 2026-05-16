import { Router } from 'express';
import { authenticateJwt } from '../../config/passport';
import { isAdmin } from '../../middlewares/isAdmin';
import { getMemberStatsHandler } from '../controllers/admin-stats.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: AdminStats
 *     description: 관리자 - 대시보드 통계 API
 */

/**
 * @swagger
 * /api/admin/stats/members:
 *   get:
 *     summary: 회원 가입 현황 조회
 *     description: |
 *       관리자 대시보드의 사용자 통계 영역에서 사용할 회원 가입 현황을 조회합니다.
 *
 *       - 총 회원수: 탈퇴(`deleted`) 상태를 제외한 전체 회원수
 *       - 가입 경로별 비율: 자체 이메일(`NONE`) / 구글 / 카카오 / 네이버
 *
 *       `ratio`는 0~1 사이 값(소수점 4자리)으로 반환됩니다.
 *     tags: [AdminStats]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 회원 가입 현황을 조회했습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_members: { type: integer, example: 1234 }
 *                     by_signup_channel:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: object
 *                           properties:
 *                             count: { type: integer, example: 700 }
 *                             ratio: { type: number, example: 0.5673 }
 *                         google:
 *                           type: object
 *                           properties:
 *                             count: { type: integer, example: 250 }
 *                             ratio: { type: number, example: 0.2026 }
 *                         kakao:
 *                           type: object
 *                           properties:
 *                             count: { type: integer, example: 200 }
 *                             ratio: { type: number, example: 0.1621 }
 *                         naver:
 *                           type: object
 *                           properties:
 *                             count: { type: integer, example: 84 }
 *                             ratio: { type: number, example: 0.0681 }
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
router.get('/members', authenticateJwt, isAdmin, getMemberStatsHandler);

export default router;
