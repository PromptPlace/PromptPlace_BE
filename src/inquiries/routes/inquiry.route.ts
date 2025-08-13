import { Router } from "express";
import { InquiryController } from "../controllers/inquiry.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();
const inquiryController = new InquiryController();

/**
 * @swagger
 * tags:
 *   name: Inquiry
 *   description: 1:1 문의 관련 API
 */

/**
 * @swagger
 * /api/inquiries:
 *   post:
 *     summary: 1:1 문의 등록
 *     tags: [Inquiry]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiver_id
 *               - type
 *               - title
 *               - content
 *             properties:
 *               receiver_id:
 *                 type: integer
 *                 description: 수신자 회원 ID
 *               type:
 *                 type: string
 *                 enum: [buyer, non_buyer]
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: 문의 등록 성공
 */
router.post(
  "/",
  authenticateJwt,
  inquiryController.createInquiry.bind(inquiryController)
);

/**
 * @swagger
 * /api/inquiries/received:
 *   get:
 *     summary: 받은 문의 목록 조회
 *     tags: [Inquiry]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [buyer, non_buyer]
 *         description: 필터링할 문의 유형
 *     responses:
 *       200:
 *         description: 받은 문의 목록 조회 성공
 */
router.get(
  "/received",
  authenticateJwt,
  inquiryController.getReceivedInquiries.bind(inquiryController)
);

/**
 * @swagger
 * /api/inquiries/{inquiryId}:
 *   get:
 *     summary: 문의 상세 조회
 *     tags: [Inquiry]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: inquiryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 문의 ID
 *     responses:
 *       200:
 *         description: 문의 상세 조회 성공
 */
router.get(
  "/:inquiryId",
  authenticateJwt,
  inquiryController.getInquiryById.bind(inquiryController)
);

/**
 * @swagger
 * /api/inquiries/{inquiryId}/replies:
 *   post:
 *     summary: 문의 답변 등록
 *     tags: [Inquiry]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: inquiryId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: 답변 드립니다. 감사합니다.
 *     responses:
 *       201:
 *         description: 답변 등록 성공
 */
// 문의 답변 등록 API
router.post(
  "/:inquiryId/replies",
  authenticateJwt,
  inquiryController.createInquiryReply.bind(inquiryController)
);

/**
 * @swagger
 * /api/inquiries/{inquiryId}/read:
 *   patch:
 *     summary: 문의 읽음 처리
 *     tags: [Inquiry]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: inquiryId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 읽음 처리 성공
 */
// 문의 읽음 처리 API
router.patch(
  "/:inquiryId/read",
  authenticateJwt,
  inquiryController.markInquiryAsRead.bind(inquiryController)
);

/**
 * @swagger
 * /api/inquiries/{inquiryId}:
 *   delete:
 *     summary: 문의 삭제
 *     tags: [Inquiry]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: inquiryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 문의 ID
 *     responses:
 *       200:
 *         description: 문의 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 문의가 성공적으로 삭제되었습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *                 message:
 *                   type: string
 *                   example: 로그인이 필요합니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Forbidden
 *                 message:
 *                   type: string
 *                   example: 문의를 삭제할 권한이 없습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *       404:
 *         description: 문의 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: NotFound
 *                 message:
 *                   type: string
 *                   example: 해당 문의를 찾을 수 없습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: InternalServerError
 *                 message:
 *                   type: string
 *                   example: 알 수 없는 오류가 발생했습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */
// 문의 삭제 API
router.delete(
  "/:inquiryId",
  authenticateJwt,
  inquiryController.deleteInquiry.bind(inquiryController)
);

export default router;
