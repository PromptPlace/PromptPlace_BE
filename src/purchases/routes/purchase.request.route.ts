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
 *     summary: 결제 요청 생성
 *     description: 결제 시작을 위한 요청을 생성합니다.
 *     tags: [Purchase]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt_id:
 *                 type: integer
 *               pg:
 *                 type: string
 *                 enum: [kakaopay, tosspayments]
 *               merchant_uid:
 *                 type: string
 *               amount:
 *                 type: integer
 *               buyer_name:
 *                 type: string
 *               redirect_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: 결제 요청 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 payment_gateway:
 *                   type: string
 *                 merchant_uid:
 *                   type: string
 *                 redirect_url:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 리소스 없음
 *       409:
 *         description: 중복/상태 충돌
 */
router.post('/requests', authenticateJwt, PurchaseRequestController.requestPurchase);

/**
 * @swagger
 * /api/prompts/purchases/complete:
 *   post:
 *     summary: 결제 완료 처리(Webhook/리다이렉트 후 서버 검증)
 *     description: 포트원 imp_uid 기반으로 서버에서 결제 검증 후 구매/결제/정산을 기록합니다.
 *     tags: [Purchase]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imp_uid:
 *                 type: string
 *               merchant_uid:
 *                 type: string
 *     responses:
 *       200:
 *         description: 결제 완료 처리 성공
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
 *                   nullable: true
 *                 statusCode:
 *                   type: integer
 *       400:
 *         description: 검증 실패/유효하지 않은 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 리소스 없음
 *       409:
 *         description: 충돌
 *       500:
 *         description: 서버 오류
 */
router.post('/complete', authenticateJwt, PurchaseCompleteController.completePurchase);

/**
 * @swagger
 * /api/prompts/purchases:
 *   get:
 *     summary: 내 결제 내역 조회
 *     description: 인증된 사용자의 결제(구매) 내역을 조회합니다.
 *     tags: [Purchase]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: 페이지 번호 (옵션)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         required: false
 *         description: 페이지 크기 (옵션)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Succeed, Failed, Pending]
 *         required: false
 *         description: 결제 상태 필터 (옵션)
 *     responses:
 *       200:
 *         description: 결제 내역 조회 성공
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
 *                       purchased_at:
 *                         type: string
 *                         format: date-time
 *                       seller_nickname:
 *                         type: string
 *                         nullable: true
 *                       pg:
 *                         type: string
 *                         enum: [kakaopay, tosspay, null]
 *                 statusCode:
 *                   type: integer
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get('/', authenticateJwt, PurchaseHistoryController.list);

export default router;