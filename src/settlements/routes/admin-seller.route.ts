import { Router } from 'express';
import { authenticateJwt } from '../../config/passport';
import { isAdmin } from '../../middlewares/isAdmin';
import {
  approveSeller,
  cancelSellerHandler,
  getBusinessSellerDetailHandler,
  getBusinessSellerList,
  getIndividualSellerDetailHandler,
  getIndividualSellerList,
  getPendingSellerDetail,
  getPendingSellerList,
  rejectSeller,
} from '../controllers/admin-seller.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: AdminSeller
 *     description: 관리자 - 판매자 관리 API
 */

/**
 * @swagger
 * /api/admin/sellers/pending:
 *   get:
 *     summary: 사업자 판매자 승인 대기 목록 조회
 *     description: 관리자가 승인 대기 상태(`PENDING`)인 사업자 판매자 등록 신청 목록을 조회합니다.
 *     tags: [AdminSeller]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: 페이지 당 항목 수
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
 *                   example: 승인 대기 사업자 판매자 목록을 조회했습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               user_id: { type: integer, example: 12 }
 *                               name: { type: string, example: 홍길동 }
 *                               nickname: { type: string, example: gildong }
 *                               email: { type: string, example: gildong@example.com }
 *                               profile_image_url:
 *                                 type: string
 *                                 nullable: true
 *                                 example: https://cdn.example.com/users/12.png
 *                           business_number: { type: string, nullable: true, example: "123-45-67890" }
 *                           company_name: { type: string, nullable: true, example: 홍길동컴퍼니 }
 *                           representative_name: { type: string, nullable: true, example: 홍길동 }
 *                           business_license_url:
 *                             type: string
 *                             nullable: true
 *                             example: https://s3.example.com/licenses/12.pdf
 *                           created_at: { type: string, format: date-time }
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page: { type: integer, example: 1 }
 *                         limit: { type: integer, example: 10 }
 *                         total: { type: integer, example: 23 }
 *                         total_pages: { type: integer, example: 3 }
 *                         has_next: { type: boolean, example: true }
 *       401:
 *         description: 인증 실패 - 로그인하지 않은 사용자
 *       403:
 *         description: 권한 없음 - 관리자가 아님
 */
router.get('/pending', authenticateJwt, isAdmin, getPendingSellerList);

/**
 * @swagger
 * /api/admin/sellers/pending/{userId}:
 *   get:
 *     summary: 사업자 판매자 승인 대기 상세 조회
 *     description: 관리자가 특정 사용자의 승인 대기 중인 사업자 등록 신청 상세 정보를 조회합니다.
 *     tags: [AdminSeller]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
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
 *                   example: 승인 대기 사업자 판매자 상세 정보를 조회했습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id: { type: integer }
 *                         name: { type: string }
 *                         nickname: { type: string }
 *                         email: { type: string }
 *                         profile_image_url: { type: string, nullable: true }
 *                     business_number: { type: string, nullable: true }
 *                     company_name: { type: string, nullable: true }
 *                     representative_name: { type: string, nullable: true }
 *                     business_license_url: { type: string, nullable: true }
 *                     bank_code: { type: string }
 *                     account_number: { type: string }
 *                     account_holder: { type: string }
 *                     created_at: { type: string, format: date-time }
 *       400:
 *         description: 유효하지 않은 사용자 ID
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 승인 대기 중인 신청이 존재하지 않음
 */
router.get('/pending/:userId', authenticateJwt, isAdmin, getPendingSellerDetail);

/**
 * @swagger
 * /api/admin/sellers/pending/{userId}/approve:
 *   patch:
 *     summary: 사업자 판매자 등록 승인
 *     description: 관리자가 사업자 판매자 등록 신청을 승인합니다. `SettlementAccount.status`가 `APPROVED`로 전환되고 `is_active`가 `true`로 설정됩니다.
 *     tags: [AdminSeller]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 승인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 사업자 판매자 등록을 승인했습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id: { type: integer, example: 12 }
 *       400:
 *         description: 유효하지 않은 사용자 ID
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 승인 대기 중인 신청이 존재하지 않음
 */
router.patch(
  '/pending/:userId/approve',
  authenticateJwt,
  isAdmin,
  approveSeller,
);

/**
 * @swagger
 * /api/admin/sellers/pending/{userId}:
 *   delete:
 *     summary: 사업자 판매자 등록 반려
 *     description: 관리자가 사업자 판매자 등록 신청을 반려합니다. `SettlementAccount.status`가 `REJECTED`로 전환되어 승인 대기 목록에서 제외됩니다(soft delete).
 *     tags: [AdminSeller]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 반려 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 사업자 판매자 등록을 반려했습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id: { type: integer, example: 12 }
 *       400:
 *         description: 유효하지 않은 사용자 ID
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 승인 대기 중인 신청이 존재하지 않음
 */
router.delete('/pending/:userId', authenticateJwt, isAdmin, rejectSeller);

/**
 * @swagger
 * /api/admin/sellers/individual:
 *   get:
 *     summary: 개인 판매자 목록 조회 / 검색
 *     description: 관리자가 승인 완료(`APPROVED`) 상태의 개인 판매자 목록을 조회합니다. `search` 파라미터로 실명/이메일/닉네임 부분 일치 검색이 가능합니다.
 *     tags: [AdminSeller]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: 페이지 당 항목 수
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 실명, 이메일, 닉네임 부분 일치 검색어
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
 *                   example: 개인 판매자 목록을 조회했습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user_id: { type: integer, example: 12 }
 *                           name: { type: string, example: 홍길동 }
 *                           email: { type: string, example: gildong@example.com }
 *                           settlement_account:
 *                             type: object
 *                             properties:
 *                               bank_code: { type: string, example: KOOKMIN }
 *                               account_number: { type: string, example: "1234567890" }
 *                               account_holder: { type: string, example: 홍길동 }
 *                           created_at: { type: string, format: date-time }
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page: { type: integer, example: 1 }
 *                         limit: { type: integer, example: 10 }
 *                         total: { type: integer, example: 23 }
 *                         total_pages: { type: integer, example: 3 }
 *                         has_next: { type: boolean, example: true }
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
router.get('/individual', authenticateJwt, isAdmin, getIndividualSellerList);

/**
 * @swagger
 * /api/admin/sellers/business:
 *   get:
 *     summary: 사업자 판매자 목록 조회 / 검색
 *     description: 관리자가 승인 완료(`APPROVED`) 상태의 사업자 판매자 목록을 조회합니다. `search` 파라미터로 실명/이메일/닉네임 부분 일치 검색이 가능합니다.
 *     tags: [AdminSeller]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 실명, 이메일, 닉네임 부분 일치 검색어
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
 *                   example: 사업자 판매자 목록을 조회했습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user_id: { type: integer, example: 12 }
 *                           profile_image_url:
 *                             type: string
 *                             nullable: true
 *                             example: https://cdn.example.com/users/12.png
 *                           nickname: { type: string, example: gildong }
 *                           name: { type: string, example: 홍길동 }
 *                           email: { type: string, example: gildong@example.com }
 *                           settlement_account:
 *                             type: object
 *                             properties:
 *                               bank_code: { type: string, example: KOOKMIN }
 *                               account_number: { type: string, example: "1234567890" }
 *                               account_holder: { type: string, example: 홍길동 }
 *                           created_at: { type: string, format: date-time }
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page: { type: integer, example: 1 }
 *                         limit: { type: integer, example: 10 }
 *                         total: { type: integer, example: 23 }
 *                         total_pages: { type: integer, example: 3 }
 *                         has_next: { type: boolean, example: true }
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
router.get('/business', authenticateJwt, isAdmin, getBusinessSellerList);

/**
 * @swagger
 * /api/admin/sellers/individual/{userId}:
 *   get:
 *     summary: 개인 판매자 상세 조회
 *     description: 관리자가 승인 완료(`APPROVED`)된 개인 판매자의 상세 정보를 조회합니다.
 *     tags: [AdminSeller]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
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
 *                   example: 개인 판매자 상세 정보를 조회했습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id: { type: integer, example: 12 }
 *                     profile_image_url: { type: string, nullable: true }
 *                     nickname: { type: string, example: gildong }
 *                     name: { type: string, example: 홍길동 }
 *                     email: { type: string, example: gildong@example.com }
 *                     registration_type: { type: string, example: INDIVIDUAL }
 *                     settlement_account:
 *                       type: object
 *                       properties:
 *                         bank_code: { type: string, example: KOOKMIN }
 *                         account_number: { type: string, example: "1234567890" }
 *                         account_holder: { type: string, example: 홍길동 }
 *                     created_at: { type: string, format: date-time }
 *                     updated_at: { type: string, format: date-time }
 *       400:
 *         description: 유효하지 않은 사용자 ID
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 승인 완료된 개인 판매자 정보가 존재하지 않음
 */
router.get(
  '/individual/:userId',
  authenticateJwt,
  isAdmin,
  getIndividualSellerDetailHandler,
);

/**
 * @swagger
 * /api/admin/sellers/business/{userId}:
 *   get:
 *     summary: 사업자 판매자 상세 조회
 *     description: 관리자가 승인 완료(`APPROVED`)된 사업자 판매자의 상세 정보를 조회합니다. 사업자등록증 URL과 사업자 정보를 포함합니다.
 *     tags: [AdminSeller]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
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
 *                   example: 사업자 판매자 상세 정보를 조회했습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id: { type: integer, example: 12 }
 *                     profile_image_url: { type: string, nullable: true }
 *                     nickname: { type: string, example: gildong }
 *                     name: { type: string, example: 홍길동 }
 *                     email: { type: string, example: gildong@example.com }
 *                     registration_type: { type: string, example: BUSINESS }
 *                     business_number: { type: string, nullable: true, example: "123-45-67890" }
 *                     representative_name: { type: string, nullable: true, example: 홍길동 }
 *                     company_name: { type: string, nullable: true, example: 홍길동컴퍼니 }
 *                     business_license_url:
 *                       type: string
 *                       nullable: true
 *                       example: https://s3.example.com/licenses/12.pdf
 *                     settlement_account:
 *                       type: object
 *                       properties:
 *                         bank_code: { type: string }
 *                         account_number: { type: string }
 *                         account_holder: { type: string }
 *                     created_at: { type: string, format: date-time }
 *                     updated_at: { type: string, format: date-time }
 *       400:
 *         description: 유효하지 않은 사용자 ID
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 승인 완료된 사업자 판매자 정보가 존재하지 않음
 */
router.get(
  '/business/:userId',
  authenticateJwt,
  isAdmin,
  getBusinessSellerDetailHandler,
);

/**
 * @swagger
 * /api/admin/sellers/{userId}:
 *   delete:
 *     summary: 판매자 등록 취소
 *     description: |
 *       관리자가 승인 완료(`APPROVED`) 상태의 판매자(개인/사업자 공통) 등록을 취소합니다.
 *       다음 작업이 트랜잭션으로 함께 수행됩니다.
 *
 *       - 사용자의 활성 프롬프트 일괄 비활성화 (`Prompt.inactive_date = now()`)
 *       - `SettlementAccount` 레코드 하드 삭제
 *
 *       기존 구매/정산 이력은 영향받지 않습니다.
 *     tags: [AdminSeller]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 판매자 등록을 취소했습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id: { type: integer, example: 12 }
 *                     deactivated_prompt_count: { type: integer, example: 5 }
 *       400:
 *         description: 유효하지 않은 사용자 ID
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 승인 완료된 판매자가 아님
 */
router.delete('/:userId', authenticateJwt, isAdmin, cancelSellerHandler);

export default router;
