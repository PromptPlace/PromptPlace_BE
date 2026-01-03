import express from 'express';
import { authenticateJwt } from '../../config/passport';
import {    
    postReport,
    getReportedPrompts,
    getReportedPromptById,
} from '../controllers/report.controller';
import { get } from 'http';

const router = express.Router(); 

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: 프롬프트 신고 관련 API
 */
/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: 프롬프트 신고 등록
 *     tags: [Report]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prompt_id, report_type, description]
 *             properties:
 *               prompt_id:
 *                 type: integer
 *                 description: 신고 대상 프롬프트 ID
 *                 example: 1
 *               report_type:
 *                 type: string
 *                 enum:
 *                   - FALSE_OR_EXAGGERATED
 *                   - COPYRIGHT_INFRINGEMENT
 *                   - INAPPROPRIATE_OR_HARMFUL
 *                   - ETC
 *                 description: |
 *                   신고 유형
 *                   - FALSE_OR_EXAGGERATED: 허위 또는 과장된 콘텐츠
 *                   - COPYRIGHT_INFRINGEMENT: 저작권 및 지적재산권 침해
 *                   - INAPPROPRIATE_OR_HARMFUL: 불쾌하거나 부적절한 내용
 *                   - ETC: 기타
 *                 example: FALSE_OR_EXAGGERATED
 *               description:
 *                 type: string
 *                 description: 신고 상세 설명
 *                 example: 부적절한 프롬프트에요
 *     responses:
 *       200:
 *         description: 프롬프트 신고가 성공적으로 접수되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 프롬프트 신고가 성공적으로 접수되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     report_id: { type: integer, example: 12 }
 *                     reporter_id: { type: integer, example: 10 }
 *                     prompt_id: { type: integer, example: 3 }
 *                     description: { type: string, example: 부적절한 프롬프트에요 }
 *                     created_at: { type: string, format: date-time, example: 2025-07-29T17:43:32.317Z }
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401: { description: 인증 실패 }
 *       500: { description: 서버 오류 }
 */

router.post('/', authenticateJwt, postReport); // 특정 프롬프트에 대한 신고 등록
/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: 신고된 프롬프트 목록 조회 (관리자 전용)
 *     description: |
 *       커서 기반 페이지네이션(cursor-based-pagination) 사용.
 *       - `cursor`는 이전 요청에서 받은 마지막 목록의 ID를 의미하며, 이를 기준으로 이후 데이터를 조회.
 *       - 첫 요청 시에는 `cursor`를 생략하여 최신 신고부터 조회.
 *       - `has_more` 속성으로 더 불러올 데이터가 있는지 미리 확인 가능.
 *     tags: [Report]
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
 *         description: 가져올 신고 수 (기본값 10)
 *     responses:
 *       200:
 *         description: 신고된 프롬프트 목록을 성공적으로 불러왔습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 신고된 프롬프트 목록을 성공적으로 불러왔습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     reports:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           report_id:
 *                             type: integer
 *                             example: 56
 *                           prompt_id:
 *                             type: integer
 *                             example: 11
 *                           prompt_title:
 *                             type: string
 *                             example: 프롬프트 제목
 *                           reporter_id:
 *                             type: integer
 *                             example: 12
 *                           reporter_nickname:
 *                             type: string
 *                             example: 신고자 닉네임1
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-07-27T12:11:02.000Z
 *                           is_read:
 *                             type: boolean
 *                             example: false
 *                     has_more:
 *                       type: boolean
 *                       example: false
 *                     total_count:
 *                       type: integer
 *                       example: 57
 *                       description: 시스템에 존재하는 전체 신고 수
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */


router.get('/', authenticateJwt, getReportedPrompts); // 신고 당한 프롬프트 목록 조회(관리자용)
/**
 * @swagger
 * /api/reports/{reportId}:
 *   get:
 *     summary: 특정 신고 상세 조회 (관리자 전용)
 *     tags: [Report]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 신고 ID
 *     responses:
 *       200:
 *         description: 프롬프트 신고 상세 정보를 성공적으로 불러왔습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 프롬프트 신고 상세 정보를 성공적으로 불러왔습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     report_id:
 *                       type: integer
 *                       example: 5
 *                     prompt_id:
 *                       type: integer
 *                       example: 5
 *                     prompt_title:
 *                       type: string
 *                       example: 프롬프트 3
 *                     reporter_id:
 *                       type: integer
 *                       example: 10
 *                     reporter_nickname:
 *                       type: string
 *                       example: 남아린
 *                     reporter_email:
 *                       type: string
 *                       example: 20230871@duksung.ac.kr
 *                     prompt_type:
 *                       type: string
 *                       example: ETC
 *                     description:
 *                       type: string
 *                       example: 기타 문제로 신고합니다.
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-07-29T17:24:19.749Z
 *                     isRead:
 *                       type: boolean
 *                       example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 신고 정보 없음
 *       500:
 *         description: 서버 오류
 */

router.get('/:reportId', authenticateJwt, getReportedPromptById); // 특정 신고 조회(관리자용)
export default router;
