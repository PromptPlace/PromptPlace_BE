import { Router } from "express";
import { createOrGetChatRoom, getChatRoomDetail, getChatRoomList, blockUser, leaveChatRoom, getPresignedUrl, togglePinChatRoom} from "../controllers/chat.controller";
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
 *       401:
 *         description: 인증 실패 (토큰 없음/만료/유효하지 않음)
 */

router.post("/rooms", authenticateJwt, createOrGetChatRoom);

/**
 * @swagger
 * /api/chat/rooms/{roomId}:
 *   get:
 *     summary: 채팅방 상세 조회
 *     description: >
 *       채팅방 상세 정보(상대 정보/차단 상태/메시지 목록/페이지 정보)를 조회합니다.<br/>
 *       메시지는 최신순(DESC)으로 반환되며, cursor 기반으로 과거 메시지를 추가로 불러올 수 있습니다.
 *     tags: [Chat]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 채팅방 ID
 *         example: 2
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: integer
 *         description: 이번 응답에서 가장 오래된 message_id (첫 요청은 생략)
 *         example: 70
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 가져올 메시지 개수 (기본값 20)
 *         example: 20
 *     responses:
 *       200:
 *         description: 채팅방 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 채팅방 상세를 성공적으로 조회했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     room:
 *                       type: object
 *                       properties:
 *                         room_id:
 *                           type: integer
 *                           example: 2
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-08-21T12:26:42.522Z
 *                         is_pinned:
 *                           type: boolean
 *                           example: true
 *                     my:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           example: 45
 *                         left_at:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-01-20T10:00:00.000Z
 *                     partner:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           example: 67
 *                         nickname:
 *                           type: string
 *                           example: 달팽이
 *                         profile_image_url:
 *                           type: string
 *                           example: https://...png
 *                         role:
 *                           type: string
 *                           example: USER
 *                     block_status:
 *                       type: object
 *                       properties:
 *                         i_blocked_partner:
 *                           type: boolean
 *                           example: true
 *                         partner_blocked_me:
 *                           type: boolean
 *                           example: false
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           message_id:
 *                             type: integer
 *                             example: 56
 *                           sender_id:
 *                             type: integer
 *                             example: 45
 *                           content:
 *                             type: string
 *                             example: 혹시 이 사진이랑 파일도 프롬프트에 사용할 수 있나요?
 *                           sent_at:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-08-21T12:26:42.522Z
 *                           attachments:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 attachment_id:
 *                                   type: integer
 *                                   example: 23
 *                                 url:
 *                                   type: string
 *                                   example: https://...png
 *                                 type:
 *                                   type: string
 *                                   enum: [IMAGE, FILE]
 *                                   example: IMAGE
 *                                 original_name:
 *                                   type: string
 *                                   example: picture.png
 *                                 size:
 *                                   type: integer
 *                                   example: 27187
 *                                 created_at:
 *                                   type: string
 *                                   format: date-time
 *                                   example: 2025-08-21T12:26:42.522Z
 *                     page:
 *                       type: object
 *                       properties:
 *                         has_more:
 *                           type: boolean
 *                           example: false
 *                         total_count:
 *                           type: integer
 *                           example: 2
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: 인증 실패 (토큰 없음/만료/유효하지 않음)
 *       404:
 *         description: 채팅방을 찾을 수 없음
 */


router.get("/rooms/:roomId", authenticateJwt, getChatRoomDetail);

/**
 * @swagger
 * /api/chat/rooms:
 *   get:
 *     summary: 채팅방 목록 조회
 *     description: >
 *       내 채팅방 목록을 조회합니다.<br/>
 *       메세지가 존재하지 않으면 해당 채팅방은 목록에서 제외됩니다.<br/>
 *       filter(전체/안읽음/고정), search(상대 닉네임 검색), cursor 기반 페이징을 지원합니다.
 *     tags: [Chat]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *           type: string
 *           enum: [all, unread, pinned]
 *           default: all
 *         description: 조회 필터 (기본값 all)
 *         example: unread
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: 상대방 닉네임 검색 키워드 (기본값 없음)
 *         example: 달팽이
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: integer
 *         description: 마지막으로 조회된 room_id (첫 요청 생략 가능)
 *         example: 70
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 가져올 채팅방 개수 (기본값 20)
 *         example: 20
 *     responses:
 *       200:
 *         description: 채팅방 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 채팅방 목록을 성공적으로 조회했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     rooms:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           room_id:
 *                             type: integer
 *                             example: 12
 *                           partner:
 *                             type: object
 *                             properties:
 *                               user_id:
 *                                 type: integer
 *                                 example: 67
 *                               nickname:
 *                                 type: string
 *                                 example: 달팽이
 *                               profile_image_url:
 *                                 type: string
 *                                 example: https://...png
 *                           last_message:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               content:
 *                                 type: string
 *                                 nullable: true
 *                                 example: 안녕하세요 너무 신기하네요
 *                               sent_at:
 *                                 type: string
 *                                 format: date-time
 *                                 nullable: true
 *                                 example: 2025-10-18T10:15:00Z
 *                               has_attachments:
 *                                 type: boolean
 *                                 example: false
 *                               attachment_summary:
 *                                 type: object
 *                                 nullable: true
 *                                 properties:
 *                                   image_count:
 *                                     type: integer
 *                                     example: 2
 *                                   file_count:
 *                                     type: integer
 *                                     example: 0
 *                           unread_count:
 *                             type: integer
 *                             example: 123
 *                           is_pinned:
 *                             type: boolean
 *                             example: false
 *                     page:
 *                       type: object
 *                       properties:
 *                         has_more:
 *                           type: boolean
 *                           example: false
 *                         total_count:
 *                           type: integer
 *                           example: 3
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: 잘못된 요청 (유효하지 않은 filter 값)
 *       401:
 *         description: 인증 실패 (토큰 없음/만료/유효하지 않음)
 */

router.get("/rooms", authenticateJwt, getChatRoomList);
/**
 * @swagger
 * /api/chat/block:
 *   post:
 *     summary: 사용자 차단
 *     description: >
 *       상대방을 차단합니다.
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
 *               - blocked_user_id
 *             properties:
 *               blocked_user_id:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: 차단 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 상대방을 성공적으로 차단했습니다.
 *                 data:
 *                   nullable: true
 *                   example: null
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *        description: 잘못된 요청
 *       401:
 *         description: 인증 실패 (토큰 없음/만료/유효하지 않음)
 */

router.post("/block", authenticateJwt, blockUser);
/**
 * @swagger
 * /api/chat/rooms/{roomId}/leave:
 *   patch:
 *     summary: 채팅방 나가기
 *     description: >
 *       채팅방을 나갑니다.<br/>
 *       채팅방을 나가면 채팅방 목록 조회 리스트에서 제외됩니다. <br/>
 *       나갔더라도 채팅방은 유지되며 계속적으로 수신이 가능합니다. 다시 입장할 수 있지만 나가기 전 메시지들은 볼 수 없습니다.
 *       
 *     tags: [Chat]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 채팅방 ID
 *         example: 2
 *     responses:
 *       200:
 *         description: 채팅방 나가기 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 채팅방을 성공적으로 나갔습니다.
 *                 data:
 *                   nullable: true
 *                   example: null
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패 (토큰 없음/만료/유효하지 않음)
 */

router.patch("/rooms/:roomId/leave", authenticateJwt, leaveChatRoom);
/**
 * @swagger
 * /api/chat/presigned-url:
 *   post:
 *     summary: Presigned URL 발급
 *     description: >
 *       파일 업로드를 위한 presigned url을 발급합니다.<br/><br/>
 *       **업로드 프로세스:**<br/>
 *       1) 본 API를 호출하여 파일별 url 과 key 를 받습니다.<br/>
 *       2) 받은 url 로 PUT 요청을 보내 실제 파일을 업로드합니다.<br/>
 *       3) 업로드가 모두 성공하면, 채팅 메시지 전송 API 호출 시 서버로부터 받은 key 값들을 함께 보냅니다.
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
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - content_type
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: cat.jpg
 *                     content_type:
 *                       type: string
 *                       example: image/jpg
 *           example:
 *             files:
 *               - name: cat.jpg
 *                 content_type: image/jpg
 *               - name: dog.png
 *                 content_type: image/png
 *               - name: info.pdf
 *                 content_type: application/pdf
 *     responses:
 *       200:
 *         description: presign 발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: presign을 성공적으로 발급했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: cat.jpg
 *                           url:
 *                             type: string
 *                             example: https://s3.aws.com/bucket/random-key-1?signature=...
 *                           key:
 *                             type: string
 *                             example: uploads/random-key-1.jpg
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *             example:
 *               message: presign을 성공적으로 발급했습니다.
 *               data:
 *                 attachments:
 *                   - name: cat.jpg
 *                     url: https://s3.aws.com/bucket/random-key-1?signature=...
 *                     key: uploads/random-key-1.jpg
 *                   - name: dog.jpg
 *                     url: https://s3.aws.com/bucket/random-key-2?signature=...
 *                     key: uploads/random-key-2.png
 *                   - name: info.pdf
 *                     url: https://s3.aws.com/bucket/random-key-3?signature=...
 *                     key: uploads/random-key-3.pdf
 *               statusCode: 200
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패 (토큰 없음/만료/유효하지 않음)
 */

router.post("/presigned-url", authenticateJwt, getPresignedUrl);

/**
 * @swagger
 * /api/chat/rooms/{roomId}/pin:
 *   patch:
 *     summary: 채팅방 고정 토글
 *     description: >
 *       채팅방 고정을 토글합니다.<br/><br/>
 *       `isPinned`:<br/>
 *         - false → 토글 결과 = 고정 해제<br/>
 *         - true → 토글 결과 = 고정
 *     tags: [Chat]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 채팅방 ID
 *         example: 2
 *     responses:
 *       200:
 *         description: 채팅방 고정 토글 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 채팅방 고정을 성공적으로 토글했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     isPinned:
 *                       type: boolean
 *                       example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *             example:
 *               message: 채팅방 고정을 성공적으로 토글했습니다.
 *               data:
 *                 isPinned: true
 *               statusCode: 200
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패 (토큰 없음/만료/유효하지 않음)
 *       404:
 *         description: 채팅방을 찾을 수 없음
 */
router.patch("/rooms/:roomId/pin", authenticateJwt, togglePinChatRoom);

export default router;