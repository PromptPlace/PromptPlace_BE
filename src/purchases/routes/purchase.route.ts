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
 *     summary: 결제 요청 생성 (주문서 발행)
 *     description: 프론트엔드에서 포트원 V2 결제창을 띄우기 위해 필요한 주문 번호(paymentId)와 결제 정보를 생성합니다.
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
 *                 description: 구매하려는 프롬프트의 ID
 *                 example: 12
 *     responses:
 *       200:
 *         description: 주문서 생성 성공 (PortOne V2 SDK 연동 데이터 반환)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "주문서가 생성되었습니다."
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 storeId:
 *                   type: string
 *                   description: 포트원 상점 ID (SDK 설정용)
 *                   example: "store-abc12345..."
 *                 paymentId:
 *                   type: string
 *                   description: 서버에서 생성한 고유 주문 번호 (구 merchant_uid)
 *                   example: "payment-550e8400-e29b-41d4-a716-446655440000"
 *                 orderName:
 *                   type: string
 *                   description: 주문명 (프롬프트 제목)
 *                   example: "감성적인 AI 풍경화 프롬프트"
 *                 totalAmount:
 *                   type: number
 *                   description: 결제 금액 (DB 기준)
 *                   example: 5000
 *                 channelKey:
 *                   type: string
 *                   description: 포트원 채널 키 (PG사 구분용)
 *                   example: "channel-key-uuid..."
 *                 customData:
 *                   type: object
 *                   description: 결제 검증 및 웹훅 처리를 위한 메타 데이터
 *                   properties:
 *                     prompt_id:
 *                       type: integer
 *                       example: 12
 *                     user_id:
 *                       type: integer
 *                       example: 5
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

export default router;