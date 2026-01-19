import { Router } from "express";
import { createOrGetChatRoom } from "../controllers/chat.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Chat
 *     description: 채팅 관련 API
 */

/**
 * @swagger
 * /api/chat/rooms:
 *   post:
 *     summary: 채팅방 생성 또는 반환
 *     description: 상대방과의 1:1 채팅방을 생성하거나 이미 존재하는 채팅방을 반환합니다.
 *     tags: [Chat]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partner_id
 *             properties:
 *               partner_id:
 *                 type: integer
 *                 example: 34
 *     responses:
 *       200:
 *         description: 채팅방 생성/반환 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 채팅방을 성공적으로 생성/반환했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     room_id:
 *                       type: integer
 *                       example: 35
 *                     is_new:
 *                       type: boolean
 *                       example: true
 *                       description: 이미 존재하는 채팅방인 경우 false, 새로 생성된 채팅방인 경우 true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 */

router.post("/rooms", authenticateJwt, createOrGetChatRoom);

export default router;