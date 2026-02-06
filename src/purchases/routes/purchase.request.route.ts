import { Router } from 'express';
import { PurchaseCompleteController } from '../controller/purchase.complete.controller';
import { authenticateJwt } from '../../config/passport';
import { PurchaseRequestController } from '../controller/purchase.request.controller';
import { PurchaseHistoryController } from '../controller/purchase.controller';

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
 *     summary: 결제 요청 생성 (사전 검증)
 *     description: 프론트엔드에서 결제창을 띄우기 전, 주문 번호 생성 및 사전 검증을 수행합니다.
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
 *               - merchant_uid
 *               - amount
 *               - buyer_name
 *               - redirect_url
 *             properties:
 *               prompt_id:
 *                 type: integer
 *               merchant_uid:
 *                 type: string
 *                 description: 가맹점 주문 번호
 *               amount:
 *                 type: integer
 *                 description: 결제 예정 금액
 *               buyer_name:
 *                 type: string
 *               redirect_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: 요청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 merchant_uid:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 */
router.post('/requests', authenticateJwt, PurchaseRequestController.requestPurchase);

/**
 * @swagger
 * /api/prompts/purchases/complete:
 *   post:
 *     summary: 결제 완료 처리 (검증 및 저장)
 *     description: 포트원 결제 완료 후, paymentId를 서버로 보내 검증하고 구매를 확정합니다.
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
 *               - paymentId
 *             properties:
 *               paymentId:
 *                 type: string
 *                 description: 포트원 V2 결제 ID
 *               merchant_uid:
 *                 type: string
 *                 description: 가맹점 주문 번호
 *     responses:
 *       200:
 *         description: 결제 성공 및 저장 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [Succeed, Failed, Pending]
 *                 purchase_id:
 *                   type: integer
 *                 statusCode:
 *                   type: integer
 */
router.post('/complete', authenticateJwt, PurchaseCompleteController.completePurchase);

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

export default router;