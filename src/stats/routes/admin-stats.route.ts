import { Router } from 'express';
import { authenticateJwt } from '../../config/passport';
import { isAdmin } from '../../middlewares/isAdmin';
import {
  getActiveUserStatsHandler,
  getMemberStatsHandler,
} from '../controllers/admin-stats.controller';
import {
  getNewPromptStatsHandler,
  getTopSalesPromptsHandler,
} from '../controllers/admin-prompt-stats.controller';

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

/**
 * @swagger
 * /api/admin/stats/active-users:
 *   get:
 *     summary: 활성 사용자 통계 조회
 *     description: |
 *       최근 30일 롤링 윈도우 기준 활성 사용자 수와 전 구간(그 이전 30일) 대비 증감율을 반환합니다.
 *
 *       - `current_count`: now - 30d ~ now 사이에 `last_active_at`이 기록된 사용자 수
 *       - `previous_count`: now - 60d ~ now - 30d 사이의 활성 사용자 수
 *       - `change_rate`: `(current - previous) / previous` (소수 4자리). 이전 구간이 0이면 `null`
 *       - 탈퇴(`userstatus=deleted`) 사용자는 제외
 *
 *       활동 기록은 JWT 인증을 통과한 모든 요청에서 5분 throttle로 갱신됩니다.
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
 *                 message: { type: string, example: 활성 사용자 통계를 조회했습니다. }
 *                 statusCode: { type: integer, example: 200 }
 *                 data:
 *                   type: object
 *                   properties:
 *                     window_days: { type: integer, example: 30 }
 *                     current_count: { type: integer, example: 1234 }
 *                     previous_count: { type: integer, example: 1100 }
 *                     change_rate:
 *                       type: number
 *                       nullable: true
 *                       example: 0.1218
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
router.get(
  '/active-users',
  authenticateJwt,
  isAdmin,
  getActiveUserStatsHandler,
);

/**
 * @swagger
 * /api/admin/stats/prompts/new:
 *   get:
 *     summary: 신규 프롬프트 통계 조회
 *     description: |
 *       관리자 대시보드의 신규 프롬프트 영역에서 사용하는 통계 API.
 *
 *       - `daily_count`: 최근 24시간(롤링 윈도우) 동안 업로드된 활성 프롬프트 수
 *       - `weekly_count`: 최근 7일(KST 캘린더 기준) 업로드 합계
 *       - `daily_uploads`: 최근 7일치 일자별 업로드 수 (KST 기준 `YYYY-MM-DD`, 막대 그래프용)
 *
 *       비활성(`inactive_date IS NOT NULL`) 프롬프트는 모두 제외됩니다.
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
 *                 message: { type: string, example: 신규 프롬프트 통계를 조회했습니다. }
 *                 statusCode: { type: integer, example: 200 }
 *                 data:
 *                   type: object
 *                   properties:
 *                     daily_count: { type: integer, example: 12 }
 *                     weekly_count: { type: integer, example: 86 }
 *                     daily_uploads:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date: { type: string, example: "2026-05-11" }
 *                           count: { type: integer, example: 14 }
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
router.get('/prompts/new', authenticateJwt, isAdmin, getNewPromptStatsHandler);

/**
 * @swagger
 * /api/admin/stats/prompts/top-sales:
 *   get:
 *     summary: 매출 상위 프롬프트 Top 5 조회
 *     description: |
 *       최근 30일간 매출액 기준 상위 5개 프롬프트를 조회합니다.
 *
 *       - 기준: `Purchase.amount` 합계 (`is_free=false`만 합산)
 *       - 기간: 최근 30일(롤링 윈도우)
 *       - 정렬: `total_sales DESC`, 동률 시 Prisma 기본 순서
 *       - 프롬프트가 삭제·비활성화되어도 매출 집계에는 포함되며, 제목이 없을 경우 `title: null`로 반환됩니다.
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
 *                 message: { type: string, example: 매출 상위 프롬프트를 조회했습니다. }
 *                 statusCode: { type: integer, example: 200 }
 *                 data:
 *                   type: object
 *                   properties:
 *                     period_days: { type: integer, example: 30 }
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           rank: { type: integer, example: 1 }
 *                           prompt_id: { type: integer, example: 42 }
 *                           title: { type: string, nullable: true, example: "ChatGPT 마케팅 카피 30종" }
 *                           total_sales: { type: integer, example: 825000 }
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
router.get(
  '/prompts/top-sales',
  authenticateJwt,
  isAdmin,
  getTopSalesPromptsHandler,
);

export default router;
