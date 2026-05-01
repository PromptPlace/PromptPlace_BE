import { Router } from 'express';
import { authenticateJwt } from '../../config/passport';
import { PurchaseRequestController } from '../controller/purchase.request.controller';
import { PurchaseHistoryController } from '../controller/purchase.controller';
import { PurchaseCompleteController } from '../controller/purchase.complete.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Purchase
 *     description: 결제/구매 관련 API
 */

/**
 * @swagger
 * /api/prompts/purchases/requests:
 *   post:
 *     summary: 결제 요청 생성 (페이플 인증 + 주문서 발행)
 *     description: 페이플 파트너 인증을 수행하고 프론트의 PaypleCpayAuthCheck 호출에 필요한 PCD_* 필드 묶음을 반환합니다.
 *     tags: [Purchase]
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
 *             properties:
 *               prompt_id:
 *                 type: integer
 *                 example: 12
 *               pay_type:
 *                 type: string
 *                 enum: [card, transfer]
 *                 default: card
 *                 description: 결제 수단 (card=카드, transfer=계좌이체)
 *     responses:
 *       200:
 *         description: 주문서 생성 성공 (페이플 일반결제 연동 데이터 반환)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "주문서가 생성되었습니다." }
 *                 statusCode: { type: integer, example: 200 }
 *                 PCD_CST_ID: { type: string, description: "페이플 가맹점 ID" }
 *                 PCD_CUST_KEY: { type: string, description: "페이플 가맹점 Key" }
 *                 PCD_AUTH_KEY: { type: string, description: "페이플 인증 토큰" }
 *                 PCD_PAY_TYPE: { type: string, enum: [card, transfer] }
 *                 PCD_PAY_WORK: { type: string, enum: [PAY] }
 *                 PCD_PAY_HOST: { type: string, description: "페이플 결제 호스트 (재검증 시 사용)" }
 *                 PCD_PAY_URL: { type: string, description: "페이플 결제 URL (재검증 시 사용)" }
 *                 PCD_PAY_OID: { type: string, description: "서버 생성 주문 번호" }
 *                 PCD_PAY_GOODS: { type: string, description: "주문명 (프롬프트 제목)" }
 *                 PCD_PAY_TOTAL: { type: number, description: "결제 금액 (서버 검증 기준)" }
 *                 PCD_USER_DEFINE1:
 *                   type: string
 *                   description: '검증/웹훅용 메타 (JSON 문자열, prompt_id/user_id 포함)'
 *                   example: '{"prompt_id":12,"user_id":5}'
 */
router.post('/requests', authenticateJwt, PurchaseRequestController.requestPurchase);

/**
 * @swagger
 * /api/prompts/purchases:
 *   get:
 *     summary: 결제 내역 조회
 *     description: 인증된 사용자의 결제 내역을 최신순으로 조회합니다.
 *     tags: [Purchase]
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
 *                 purchases:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       prompt_id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       price:
 *                         type: integer
 *                       seller_nickname:
 *                         type: string
 *                       purchased_at:
 *                         type: string
 *                         format: date-time
 *                       pg:
 *                         type: string
 *                         description: 결제 제공자 (DB Enum)
 *                         enum: [TOSSPAYMENTS, KAKAOPAY, TOSSPAY, NAVERPAY, SAMSUNGPAY, APPLEPAY, LPAY, PAYCO, SSG, PINPAY]
 *                         nullable: true
 *                 statusCode:
 *                   type: integer
 */
router.get('/', authenticateJwt, PurchaseHistoryController.list);

/**
 * @swagger
 * /api/prompts/purchases/complete:
 *   post:
 *     summary: 결제 완료 처리 (페이플 검증 및 저장)
 *     description: 페이플 결제 완료 후 프론트가 받은 PCD_* 결과 객체를 서버로 그대로 전달하면, PCD_PAY_REQKEY로 페이플에 재검증 후 구매를 확정합니다.
 *     tags: [Purchase]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - PCD_PAY_RST
 *               - PCD_PAY_OID
 *               - PCD_PAY_REQKEY
 *               - PCD_AUTH_KEY
 *             properties:
 *               PCD_PAY_RST: { type: string, enum: [success, error, close] }
 *               PCD_PAY_CODE: { type: string }
 *               PCD_PAY_MSG: { type: string }
 *               PCD_PAY_OID: { type: string, description: "주문 번호 (요청 시 발급된 값)" }
 *               PCD_PAY_REQKEY: { type: string, description: "페이플 재검증 키" }
 *               PCD_AUTH_KEY: { type: string, description: "페이플 인증 토큰" }
 *               PCD_PAY_HOST: { type: string }
 *               PCD_PAY_URL: { type: string }
 *               PCD_PAY_TOTAL: { type: number }
 *               PCD_PAY_TYPE: { type: string }
 *               PCD_USER_DEFINE1: { type: string }
 *     responses:
 *       200:
 *         description: 결제 성공 및 저장 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 status: { type: string, enum: [Succeed, Failed, Pending] }
 *                 purchase_id: { type: integer }
 *                 statusCode: { type: integer }
 */
router.post('/complete', authenticateJwt, PurchaseCompleteController.completePurchase);

export default router;