import express from "express";
import {
  getTipList,
  createTip,
  patchTip,
  deleteTip,
} from "../controllers/tip.controllers";
import { isAdmin } from "../../middlewares/isAdmin";
import { authenticateJwt } from "../../config/passport";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Tip
 *   description: 팁 관련 API
 */

/**
 * @swagger
 * /api/tips:
 *   get:
 *     summary: 팁 목록 조회
 *     tags: [Tip]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 페이지 번호
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: 한 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 팁 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tip_id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 */
// 모두 접근 가능
router.get("/", getTipList);

/**
 * @swagger
 * /api/tips:
 *   post:
 *     summary: 팁 생성
 *     tags: [Tip]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               writer_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 팁 생성 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 관리자 권한 없음
 */
// 관리자만 접근 가능
router.post("/", authenticateJwt, isAdmin, createTip);

/**
 * @swagger
 * /api/tips/{tipId}:
 *   patch:
 *     summary: 팁 수정
 *     tags: [Tip]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: tipId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 팁 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 팁 수정 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 관리자 권한 없음
 *       404:
 *         description: 팁을 찾을 수 없음
 */
router.patch("/:tipId", authenticateJwt, isAdmin, patchTip);

/**
 * @swagger
 * /api/tips/{tipId}/delete:
 *   patch:
 *     summary: 팁 삭제 (soft delete)
 *     tags: [Tip]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: tipId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 팁 ID
 *     responses:
 *       200:
 *         description: 팁 삭제 성공
 *       400:
 *         description: 이미 삭제된 팁
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 관리자 권한 없음
 *       404:
 *         description: 팁을 찾을 수 없음
 */
router.patch("/:tipId/delete", authenticateJwt, isAdmin, deleteTip);

export default router;
