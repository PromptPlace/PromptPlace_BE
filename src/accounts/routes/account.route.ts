import { Router } from "express";
import { registerAccount, getAccount, updateAccount } from "../controllers/account.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Account
 *     description: 계좌 관련 API
 */

/**
 * @swagger
 * /api/members/me/accounts:
 *   post:
 *     summary: 계좌 등록
 *     description: 사용자가 본인의 계좌를 등록합니다. 한 사용자당 하나의 계좌만 등록 가능합니다.
 *     tags: [Account]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bank_code
 *               - account_number
 *               - account_holder
 *             properties:
 *               bank_code:
 *                 type: string
 *                 example: "090"
 *               account_number:
 *                 type: string
 *                 example: "3333222111000"
 *               account_holder:
 *                 type: string
 *                 example: "홍길동"
 *     responses:
 *       200:
 *         description: 계좌 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 계좌 정보가 등록되었습니다.
 *                 account_id:
 *                   type: integer
 *                   example: 123
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: 유효하지 않은 은행 코드 등 잘못된 요청
 *       409:
 *         description: 이미 계좌가 등록된 경우
 */
router.post("/accounts", authenticateJwt, registerAccount);

/**
 * @swagger
 * /api/members/me/accounts:
 *   get:
 *     summary: 계좌 정보 조회
 *     description: 로그인한 사용자의 등록된 계좌 정보를 조회합니다.
 *     tags: [Account]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 계좌 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 계좌 정보를 불러왔습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     account_id:
 *                       type: integer
 *                       example: 123
 *                     bank_code:
 *                       type: string
 *                       example: "090"
 *                     bank_name:
 *                       type: string
 *                       example: "카카오뱅크"
 *                     account_number:
 *                       type: string
 *                       example: "3333222111000"
 *                     account_holder:
 *                       type: string
 *                       example: "홍길동"
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 등록된 계좌 정보 없음
 */
router.get("/accounts", authenticateJwt, getAccount);

/**
 * @swagger
 * /api/members/me/accounts:
 *   patch:
 *     summary: 계좌 정보 수정
 *     description: 등록된 계좌 정보를 새 계좌로 수정합니다. 본인 소유 계좌만 등록 가능합니다.
 *     tags: [Account]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bank_code
 *               - account_number
 *               - account_holder
 *             properties:
 *               bank_code:
 *                 type: string
 *                 example: "090"
 *               account_number:
 *                 type: string
 *                 example: "9876543210000"
 *               account_holder:
 *                 type: string
 *                 example: "홍길동"
 *     responses:
 *       200:
 *         description: 계좌 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 계좌 정보가 수정되었습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: 유효하지 않은 은행 코드 또는 중복된 계좌
 *       404:
 *         description: 등록된 계좌 없음
 */
router.patch("/accounts", authenticateJwt, updateAccount);

export default router;