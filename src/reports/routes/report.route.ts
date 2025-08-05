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
 *             required:
 *               - prompt_id
 *               - report_type
 *               - description
 *             properties:
 *               prompt_id:
 *                 type: integer
 *                 description: 신고 대상 프롬프트 ID
 *               report_type:
 *                 type: string
 *                 enum: [inappropriate, spam, etc]
 *                 description: 신고 유형
 *               description:
 *                 type: string
 *                 description: 신고 상세 설명
 *     responses:
 *       200:
 *         description: 신고 등록 성공
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.post('/', authenticateJwt, postReport); // 특정 프롬프트에 대한 신고 등록

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: 신고된 프롬프트 목록 조회 (관리자 전용)
 *     tags: [Report]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: integer
 *         description: 페이징 커서
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: 가져올 개수
 *     responses:
 *       200:
 *         description: 신고된 프롬프트 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reports:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       report_id:
 *                         type: integer
 *                       report_type:
 *                         type: string
 *                       description:
 *                         type: string
 *                       is_read:
 *                         type: boolean
 *                       prompt:
 *                         type: object
 *                         properties:
 *                           prompt_id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                       reporter:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: integer
 *                           nickname:
 *                             type: string
 *       401:
 *         description: 인증 실패
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
 *         description: 신고 상세 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report_id:
 *                   type: integer
 *                 report_type:
 *                   type: string
 *                 description:
 *                   type: string
 *                 is_read:
 *                   type: boolean
 *                 prompt:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                 reporter:
 *                   type: object
 *                   properties:
 *                     nickname:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 신고 정보 없음
 */
router.get('/:reportId', authenticateJwt, getReportedPromptById); // 특정 신고 조회(관리자용)
export default router;
