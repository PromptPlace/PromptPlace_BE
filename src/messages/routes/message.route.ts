import { Router } from "express";
import { Container } from "typedi";
import { MessageController } from "../controllers/message.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();
const messageController = Container.get(MessageController);

/**
 * @swagger
 * tags:
 *   - name: Message
 *     description: 사용자 메시지함 관련 API
 */

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: 받은 메시지 목록 조회
 *     description: 로그인한 사용자의 받은 메시지 목록을 조회합니다.
 *     tags: [Message]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 메시지 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 메시지 목록 조회 성공
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message_id:
 *                         type: integer
 *                         example: 12
 *                       title:
 *                         type: string
 *                         example: "관리자가 메시지를 보냈습니다."
 *                       is_read:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-06T09:00:00Z"
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: 인증 실패
 */
router.get('/', authenticateJwt, messageController.getReceivedMessages);

/**
 * @swagger
 * /api/messages/{message_id}:
 *   get:
 *     summary: 메시지 상세 조회
 *     description: 특정 메시지의 상세 내용을 조회합니다.
 *     tags: [Message]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: message_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 메시지 ID
 *     responses:
 *       200:
 *         description: 메시지 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 메시지 상세 조회 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     message_id:
 *                       type: integer
 *                       example: 12
 *                     title:
 *                       type: string
 *                       example: "답변이 도착했습니다."
 *                     body:
 *                       type: string
 *                       example: "문의 주신 건에 대해 안내드립니다..."
 *                     is_read:
 *                       type: boolean
 *                       example: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-06T09:00:00Z"
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 메시지 없음
 */
router.get("/:message_id", authenticateJwt, messageController.getMessageById);

/**
 * @swagger
 * /api/messages/{message_id}/read:
 *   patch:
 *     summary: 메시지 읽음 처리
 *     description: 특정 메시지를 읽음 상태로 변경합니다.
 *     tags: [Message]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: message_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 메시지 ID
 *     responses:
 *       200:
 *         description: 메시지 읽음 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 메시지가 읽음 처리되었습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 메시지 없음
 */
router.patch('/:message_id/read', authenticateJwt, messageController.markAsRead);

/**
 * @swagger
 * /api/messages/{message_id}/delete:
 *   patch:
 *     summary: 메시지 삭제
 *     description: 특정 메시지를 삭제 처리합니다. 실제 삭제가 아닌 soft delete입니다.
 *     tags: [Message]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: message_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 메시지 ID
 *     responses:
 *       200:
 *         description: 메시지 삭제 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 메시지가 삭제 처리되었습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 메시지 없음
 */
router.patch("/:message_id/delete", authenticateJwt, messageController.deleteMessage);

export default router;