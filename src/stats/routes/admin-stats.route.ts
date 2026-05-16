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
import { getVisitorStatsHandler } from '../controllers/admin-visitor-stats.controller';
import { getPopularPromptsHandler } from '../controllers/admin-popular-prompts.controller';

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
 * /api/admin/stats/visitors:
 *   get:
 *     summary: 방문자 통계 조회
 *     description: |
 *       방문자 통계를 조회합니다. 모든 카운트는 KST(Asia/Seoul) 캘린더 기준이며 Redis HyperLogLog를 사용해 고유 방문자 수를 추정(오차 ~0.81%)합니다.
 *
 *       - `daily_count`: 오늘(KST) 고유 방문자 수
 *       - `current_count`: 최근 30일 롤링 윈도우 고유 방문자 수 (합집합)
 *       - `previous_count`: 그 이전 30일 (now-60d ~ now-30d) 고유 방문자 수
 *       - `change_rate`: `(current - previous) / previous` (소수 4자리). 이전 구간 0이면 `null`
 *       - `?month=YYYY-MM` 파라미터 제공 시 `month_total`(해당 월 고유 방문자 합) + `month_daily`(일별 분포) 함께 반환
 *
 *       활동 기록은 모든 비-봇 API 요청에서 KST 일별 HyperLogLog 키에 `PFADD`로 누적됩니다.
 *     tags: [AdminStats]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           pattern: "^\\d{4}-(0[1-9]|1[0-2])$"
 *           example: "2026-05"
 *         description: 특정 월의 일별 분포 조회 (선택)
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 방문자 통계를 조회했습니다. }
 *                 statusCode: { type: integer, example: 200 }
 *                 data:
 *                   type: object
 *                   properties:
 *                     daily_count: { type: integer, example: 312 }
 *                     window_days: { type: integer, example: 30 }
 *                     current_count: { type: integer, example: 9450 }
 *                     previous_count: { type: integer, example: 8200 }
 *                     change_rate:
 *                       type: number
 *                       nullable: true
 *                       example: 0.1524
 *                     month:
 *                       type: string
 *                       nullable: true
 *                       example: "2026-05"
 *                     month_total:
 *                       type: integer
 *                       nullable: true
 *                       example: 8970
 *                     month_daily:
 *                       type: array
 *                       nullable: true
 *                       items:
 *                         type: object
 *                         properties:
 *                           date: { type: string, example: "2026-05-01" }
 *                           count: { type: integer, example: 287 }
 *       400:
 *         description: 잘못된 month 파라미터 형식
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
router.get('/visitors', authenticateJwt, isAdmin, getVisitorStatsHandler);

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

/**
 * @swagger
 * /api/admin/stats/prompts/popular:
 *   get:
 *     summary: 인기 프롬프트 Top 5 조회
 *     description: |
 *       최근 7일간 (조회수 증가분 + 다운로드 증가분) 기준 상위 5개 프롬프트를 조회합니다.
 *
 *       - 일일 스냅샷(`PromptStatDaily`)과 현재값의 차분으로 7일 윈도우 계산
 *       - 활성(`inactive_date IS NULL`) 프롬프트만 포함
 *       - 7일 전 스냅샷이 없으면 baseline=0으로 간주 (신규 프롬프트도 포함됨)
 *       - 동률 시 정렬 안정성은 보장하지 않음
 *
 *       스냅샷은 매일 00:00 KST에 자동 수행되며 90일치 보관됩니다.
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
 *                 message: { type: string, example: 인기 프롬프트를 조회했습니다. }
 *                 statusCode: { type: integer, example: 200 }
 *                 data:
 *                   type: object
 *                   properties:
 *                     period_days: { type: integer, example: 7 }
 *                     snapshot_date: { type: string, example: "2026-05-10" }
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           rank: { type: integer, example: 1 }
 *                           prompt_id: { type: integer, example: 42 }
 *                           title: { type: string, example: "ChatGPT 마케팅 카피 30종" }
 *                           views_delta: { type: integer, example: 1240 }
 *                           downloads_delta: { type: integer, example: 87 }
 *                           score: { type: integer, example: 1327 }
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
router.get(
  '/prompts/popular',
  authenticateJwt,
  isAdmin,
  getPopularPromptsHandler,
);

export default router;
