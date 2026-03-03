import { Router } from "express";
import { verifyAccount } from "../controllers/settlement.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Settlement
 *     description: 정산 관리 관련 API
 */

/**
 * @swagger
 * /api/settlements/verify-account:
 *   post:
 *     summary: 판매자 계좌 인증 및 등록
 *     description: 사용자가 입력한 은행 계좌번호의 예금주명이 포트원 API를 통해 조회한 예금주명과 일치하는지 확인 후, 인증 성공 시 유저의 정산 계좌로 등록 또는 수정(Upsert)합니다.
 *     tags: [Settlement]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - bank
 *               - accountNumber
 *               - holderName
 *             properties:
 *               name:
 *                 type: string
 *                 description: 일반 개인 판매자 실명 / 개인·법인 사업자 대표자명
 *                 example: 홍길동
 *               bank:
 *                 type: string
 *                 description: 포트원 표준 은행 코드
 *                 example: KOOKMIN
 *               accountNumber:
 *                 type: string
 *                 description: '-'를 제외한 계좌 번호
 *                 example: "1234567890"
 *               holderName:
 *                 type: string
 *                 description: 계좌 예금주명
 *                 example: 홍길동
 *     responses:
 *       200:
 *         description: 계좌 인증 및 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 계좌 인증이 완되었습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: 인증 실패 - 로그인하지 않은 사용자
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
 *       400:
 *         description: 검증 실패 (ValidationError, NameMismatch, AccountHolderMismatch, InvalidAccountInfo)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: ValidationError
 *                     message:
 *                       type: string
 *                       example: 필수 입력값(은행, 계좌번호, 실명/대표자명, 예금주명)이 모두 입력되지 않았습니다.
 *                     statusCode:
 *                       type: integer
 *                       example: 400
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: NameMismatch
 *                     message:
 *                       type: string
 *                       example: 입력하신 실명/대표자명과 예금주명이 일치하지 않습니다.
 *                     statusCode:
 *                       type: integer
 *                       example: 400
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: AccountHolderMismatch
 *                     message:
 *                       type: string
 *                       example: 인증 실패: 실제 계좌의 예금주명과 다릅니다.
 *                     statusCode:
 *                       type: integer
 *                       example: 400
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: InvalidAccountInfo
 *                     message:
 *                       type: string
 *                       example: 유효하지 않은 계좌번호이거나 지원하지 않는 은행입니다.
 *                     statusCode:
 *                       type: integer
 *                       example: 400
 *       500:
 *         description: 서버 오류 - 알 수 없는 예외 발생
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
router.post("/verify-account", authenticateJwt, verifyAccount);

export default router;