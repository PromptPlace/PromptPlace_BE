import { Router } from "express";
import { verifyAccount, ViewAccount, ViewAccountDetail } from "../controllers/settlement.account.controller";
import { registerIndividual, registerBusiness } from "../controllers/settlement.seller.controller";
import { uploadLicense } from "../controllers/settlement.seller.controller";
import { getMonthlySales, getYearlySettlements, getPendingAmount } from "../controllers/settlement.history.controller";
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
 *     summary: 판매자 계좌 인증 및 register-token 발급
 *     description: |
 *       페이플 실명-계좌 인증을 호출하고 성공 시 register-token(JWT, 5분 TTL, 1회용)을 발급합니다.
 *       프론트엔드는 인증 성공 후 받은 registerToken을 register API 호출 시 그대로 전달해야 합니다.
 *
 *       sellerType별 요청 필드:
 *       - INDIVIDUAL: name + birthDate (YYMMDD) + bank/accountNumber/holderName
 *       - BUSINESS + PERSONAL(개인사업자): name(대표자명) + birthDate(YYMMDD) + bank/accountNumber/holderName
 *       - BUSINESS + CORPORATE(법인사업자): name(대표자명) + businessNumber(10자리) + bank/accountNumber/holderName(법인명)
 *
 *       페이플 호출 한도(일일 5회)는 우리 서비스 측 Redis로 관리합니다.
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
 *               - sellerType
 *               - name
 *               - bank
 *               - accountNumber
 *               - holderName
 *             properties:
 *               sellerType:
 *                 type: string
 *                 enum: [INDIVIDUAL, BUSINESS]
 *                 example: BUSINESS
 *               businessType:
 *                 type: string
 *                 enum: [PERSONAL, CORPORATE]
 *                 description: sellerType이 BUSINESS일 때 필수. 개인사업자(PERSONAL) / 법인사업자(CORPORATE)
 *                 example: CORPORATE
 *               name:
 *                 type: string
 *                 description: 실명(INDIVIDUAL) / 대표자명(BUSINESS)
 *                 example: 홍길동
 *               birthDate:
 *                 type: string
 *                 description: 예금주 생년월일 6자리(YYMMDD). INDIVIDUAL / BUSINESS+PERSONAL 필수
 *                 example: "880212"
 *               businessNumber:
 *                 type: string
 *                 description: 사업자등록번호 10자리(숫자만). BUSINESS+CORPORATE 필수
 *                 example: "1234567890"
 *               bank:
 *                 type: string
 *                 description: 페이플 표준 은행 코드 3자리
 *                 example: "088"
 *               accountNumber:
 *                 type: string
 *                 description: 하이픈을 제외한 계좌 번호
 *                 example: "1234567890"
 *               holderName:
 *                 type: string
 *                 description: 계좌 예금주명. 법인은 법인명, 그 외엔 실명/대표자명
 *                 example: 홍길동
 *     responses:
 *       200:
 *         description: 계좌 인증 성공. registerToken 발급
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 계좌 인증이 완료되었습니다.
 *                 registerToken:
 *                   type: string
 *                   description: 등록 API 호출용 1회용 JWT(5분 TTL)
 *                 expiresIn:
 *                   type: integer
 *                   description: 토큰 만료 시간(초)
 *                   example: 300
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: 검증 실패 또는 계좌 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: ValidationError | AccountVerificationError | InvalidAccountInfo
 *                 subCode:
 *                   type: string
 *                   description: |
 *                     계좌 인증 실패 상세 코드 (프론트 모달 분기용)
 *                     NAME_MISMATCH / BANK_MISMATCH / ACCOUNT_NOT_FOUND / ACCOUNT_RESTRICTED /
 *                     UNSUPPORTED_TYPE / BANK_TIMEOUT / BANK_MAINTENANCE / LIMIT_EXCEEDED /
 *                     INVALID_BIRTHDATE / INVALID_BUSINESS_NUMBER / SYSTEM_ERROR
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *             examples:
 *               nameMismatch:
 *                 summary: 모달 1 - 예금주명 불일치
 *                 value: { error: AccountVerificationError, subCode: NAME_MISMATCH, message: "실명/대표자명과 예금주명이 일치하지 않습니다. 다시 확인해주세요.", statusCode: 400 }
 *               bankMismatch:
 *                 summary: 모달 2 - 은행 코드/계좌번호 형식 오류
 *                 value: { error: AccountVerificationError, subCode: BANK_MISMATCH, message: "선택하신 은행과 계좌번호가 일치하지 않습니다. 은행명을 다시 확인해 주세요.", statusCode: 400 }
 *               accountNotFound:
 *                 summary: 모달 3 - 없는 계좌
 *                 value: { error: AccountVerificationError, subCode: ACCOUNT_NOT_FOUND, message: "해당 계좌는 존재하지 않는 계좌입니다. 다시 확인해주세요.", statusCode: 400 }
 *               accountRestricted:
 *                 summary: 모달 4 - 거래 불가 계좌 (해약/사고/거래중지)
 *                 value: { error: AccountVerificationError, subCode: ACCOUNT_RESTRICTED, message: "입력하신 계좌는 현재 정상적인 거래가 불가능한 상태입니다. 은행 확인 후 다시 시도해 주세요.", statusCode: 400 }
 *               unsupportedType:
 *                 summary: 모달 5 - 지원하지 않는 계좌 유형
 *                 value: { error: AccountVerificationError, subCode: UNSUPPORTED_TYPE, message: "해당 계좌는 정산용으로 등록할 수 없는 유형입니다. 원화 입출금이 가능한 보통예금 계좌로 다시 시도해 주세요.", statusCode: 400 }
 *               bankTimeout:
 *                 summary: 모달 6 - 타행 통신 오류/지연
 *                 value: { error: AccountVerificationError, subCode: BANK_TIMEOUT, message: "해당 은행과의 통신이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.", statusCode: 400 }
 *               bankMaintenance:
 *                 summary: 모달 7 - 은행 점검 시간
 *                 value: { error: AccountVerificationError, subCode: BANK_MAINTENANCE, message: "현재 은행 정기 점검 시간(가능시간 : 01시 ~ 23시)입니다. 점검 종료 후 다시 시도해 주세요.", statusCode: 400 }
 *               limitExceeded:
 *                 summary: 모달 8 - 일일 인증 횟수 초과(자체 정책 5회)
 *                 value: { error: AccountVerificationError, subCode: LIMIT_EXCEEDED, message: "일일 계좌 인증 횟수를 초과했습니다. 보안을 위해 내일 다시 시도해 주세요.", statusCode: 400 }
 *               invalidBirthDate:
 *                 summary: 신규 모달 A - 생년월일 형식 오류
 *                 value: { error: AccountVerificationError, subCode: INVALID_BIRTHDATE, message: "입력하신 생년월일이 올바르지 않습니다. YYMMDD 형식으로 다시 입력해 주세요.", statusCode: 400 }
 *               invalidBusinessNumber:
 *                 summary: 신규 모달 B - 사업자등록번호 형식 오류
 *                 value: { error: AccountVerificationError, subCode: INVALID_BUSINESS_NUMBER, message: "입력하신 사업자등록번호가 올바르지 않습니다. 10자리 숫자로 다시 입력해 주세요.", statusCode: 400 }
 *               systemError:
 *                 summary: 신규 모달 C - 시스템/인프라 오류
 *                 value: { error: AccountVerificationError, subCode: SYSTEM_ERROR, message: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", statusCode: 400 }
 *               invalidAccountInfo:
 *                 summary: 지원하지 않는 은행 코드
 *                 value: { error: InvalidAccountInfo, message: "유효하지 않은 계좌번호이거나 지원하지 않는 은행입니다.", statusCode: 400 }
 *       401:
 *         description: 로그인 필요
 *       500:
 *         description: 서버 오류
 */
router.post("/verify-account", authenticateJwt, verifyAccount);

/**
 * @swagger
 * /api/settlements/accounts:
 *   get:
 *     summary: 등록된 정산 계좌 정보 조회
 *     description: 현재 로그인한 사용자의 정산 계좌(은행, 계좌번호, 예금주명) 정보를 조회합니다.
 *     tags: [Settlement]
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
 *                 message: { type: string, example: 계좌 정보 조회가 완료되었습니다. }
 *                 data:
 *                   type: object
 *                   properties:
 *                     bank: { type: string, example: "088" }
 *                     accountNumber: { type: string, example: "1234567890" }
 *                     holderName: { type: string, example: 홍길동 }
 *                     birthDate: { type: string, nullable: true, description: 예금주 생년월일 YYMMDD. CORPORATE는 null, example: "880212" }
 *                 statusCode: { type: integer, example: 200 }
 *       401:
 *         description: 로그인 필요
 *       404:
 *         description: 등록된 계좌 없음
 *       500:
 *         description: 서버 오류
 */
router.get("/accounts", authenticateJwt, ViewAccount);

/**
 * @swagger
 * /api/settlements/account/detail:
 *   get:
 *     summary: 판매자 정보 변경 화면용 상세 조회
 *     description: |
 *       정보 변경 화면에서 기존 등록 데이터를 prefill 하기 위한 상세 조회 API.
 *       사업자는 추가 필드(businessType/businessNumber/companyName/representativeName/businessLicenseUrl/status) 포함.
 *       businessNumber는 마스킹(`123-45-****0`)되어 응답되며, 변경 시 사용자가 실제 값을 다시 입력해야 함.
 *       birthDate는 본인 조회용 평문으로 응답 (정보 변경 시 계좌 재인증을 위해 prefill 필요).
 *     tags: [Settlement]
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
 *                 message: { type: string, example: 판매자 정보 조회가 완료되었습니다. }
 *                 data:
 *                   type: object
 *                   properties:
 *                     sellerType: { type: string, enum: [INDIVIDUAL, BUSINESS] }
 *                     status: { type: string, enum: [APPROVED, PENDING, REJECTED] }
 *                     isActive: { type: boolean }
 *                     bank: { type: string, example: "088" }
 *                     accountNumber: { type: string, example: "1234567890" }
 *                     holderName: { type: string, example: 홍길동 }
 *                     name: { type: string, description: 실명(INDIVIDUAL) 또는 대표자명(BUSINESS) }
 *                     birthDate: { type: string, nullable: true, description: 예금주 생년월일 YYMMDD. CORPORATE는 null, example: "880212" }
 *                     businessType: { type: string, enum: [PERSONAL, CORPORATE], nullable: true }
 *                     businessNumber: { type: string, nullable: true, description: 마스킹된 사업자번호, example: "123-45-****0" }
 *                     representativeName: { type: string, nullable: true }
 *                     companyName: { type: string, nullable: true }
 *                     businessLicenseUrl: { type: string, nullable: true }
 *                 statusCode: { type: integer, example: 200 }
 *       401:
 *         description: 로그인 필요
 *       404:
 *         description: 등록된 판매자 정보 없음
 *       500:
 *         description: 서버 오류
 */
router.get("/account/detail", authenticateJwt, ViewAccountDetail);

/**
 * @swagger
 * /api/settlements/register/individual:
 *   post:
 *     summary: 개인 판매자 등록
 *     description: |
 *       /verify-account에서 발급받은 registerToken과 약관 동의를 받아 개인 판매자로 등록합니다.
 *       registerToken은 1회용이며 만료/재사용 시 401/409 반환.
 *       기존 사업자 등록이 있으면 삭제하고 개인으로 재등록됩니다.
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
 *               - registerToken
 *               - isTermsAgreed
 *             properties:
 *               registerToken:
 *                 type: string
 *                 description: /verify-account 응답으로 받은 1회용 JWT
 *               isTermsAgreed:
 *                 type: boolean
 *                 description: 개인정보 수집 이용 동의 (반드시 true)
 *                 example: true
 *     responses:
 *       200:
 *         description: 등록 성공 (신규 또는 수정)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 개인 판매자 등록이 완료되었습니다. }
 *                 status: { type: string, enum: [APPROVED], example: APPROVED }
 *                 requiresApproval: { type: boolean, example: false, description: 개인 판매자는 즉시 승인이므로 항상 false }
 *                 statusCode: { type: integer, example: 200 }
 *       400:
 *         description: 필수값 누락 또는 약관 미동의
 *       401:
 *         description: registerToken 만료/무효 또는 로그인 필요
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: InvalidRegisterToken }
 *                 message: { type: string, example: 등록 토큰이 만료되었거나 유효하지 않습니다. 계좌 인증을 다시 진행해 주세요. }
 *                 statusCode: { type: integer, example: 401 }
 *       409:
 *         description: registerToken 재사용
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: RegisterTokenAlreadyUsed }
 *                 message: { type: string, example: 이미 사용된 등록 토큰입니다. 계좌 인증을 다시 진행해 주세요. }
 *                 statusCode: { type: integer, example: 409 }
 *       500:
 *         description: 서버 오류
 */
router.post("/register/individual", authenticateJwt, registerIndividual);

/**
 * @swagger
 * /api/settlements/upload/business-license:
 *   post:
 *     summary: 사업자등록증 업로드 (개인/법인 사업자)
 *     description: |
 *       사업자등록증 파일(jpg/jpeg/png/pdf, 최대 20MB)을 업로드합니다.
 *       업로드 시 magic-byte로 실제 파일 형식을 검증하므로 확장자 위장 파일은 415로 거부됩니다.
 *       S3 객체 키는 예측 불가한 UUID로 생성됩니다.
 *     tags: [Settlement]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: jpg / jpeg / png / pdf (최대 20MB)
 *     responses:
 *       200:
 *         description: 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 사업자등록증 업로드가 완료되었습니다. }
 *                 fileKey: { type: string, description: S3 객체 키 (DB/Register API에 전달용), example: "business-licenses/0e5b9d7a-...-.pdf" }
 *                 fileUrl: { type: string, description: 현재 형식의 S3 URL (버킷 private 전환 시 presigned로 교체 예정) }
 *                 statusCode: { type: integer, example: 200 }
 *       400:
 *         description: 파일 누락
 *       401:
 *         description: 로그인 필요
 *       413:
 *         description: 파일 용량 초과 (20MB)
 *       415:
 *         description: 지원하지 않는 파일 형식 또는 확장자 위장 (magic-byte 불일치)
 *       500:
 *         description: 서버 오류
 */
router.post("/upload/business-license", authenticateJwt, uploadLicense);

/**
 * @swagger
 * /api/settlements/register/business:
 *   post:
 *     summary: 사업자 판매자 등록/변경 신청
 *     description: |
 *       /verify-account에서 발급받은 registerToken과 추가 사업자 정보(상호명, 사업자등록증)를 받아
 *       사업자 판매자로 등록 또는 변경 신청합니다. 모든 시나리오에서 상태는 PENDING으로 저장되고 관리자 승인 후 활성화됩니다.
 *
 *       시나리오별 동작:
 *       - 최초 사업자 등록: 신규 row 생성 (PENDING, is_active=false)
 *       - 개인 → 사업자 전환: 기존 INDIVIDUAL row 삭제 + 신규 BUSINESS row 생성 (PENDING)
 *       - 사업자 → 사업자 정보 변경: 같은 row 덮어쓰기 + status=PENDING + is_active=false (승인 전까지 일시 비활성화)
 *
 *       사업자등록증(businessLicenseUrl)은 사업자 → 사업자 변경 시에만 생략 가능 (기존 URL 유지).
 *       최초 등록 / 개인→사업자 전환에는 필수.
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
 *               - registerToken
 *               - companyName
 *               - isTermsAgreed
 *             properties:
 *               registerToken:
 *                 type: string
 *                 description: /verify-account 응답으로 받은 1회용 JWT
 *               companyName:
 *                 type: string
 *                 example: (주)프롬프트팩토리
 *               businessLicenseUrl:
 *                 type: string
 *                 description: /upload/business-license 응답으로 받은 fileUrl. 사업자→사업자 변경 시에만 생략 가능
 *               isTermsAgreed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: 신청 성공 (PENDING 상태)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, description: 시나리오별 안내 메시지, example: 사업자 판매자 신청이 완료되었습니다. 관리자 승인 후 최종 등록됩니다. }
 *                 status: { type: string, enum: [PENDING], example: PENDING }
 *                 requiresApproval: { type: boolean, example: true, description: 사업자는 관리자 승인 필요 — 항상 true }
 *                 statusCode: { type: integer, example: 200 }
 *       400:
 *         description: 필수값 누락 또는 약관 미동의
 *       401:
 *         description: registerToken 만료/무효 또는 로그인 필요
 *       409:
 *         description: registerToken 재사용 / 이미 등록 / 사업자번호 중복
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, description: "RegisterTokenAlreadyUsed | DuplicateBusinessNumber" }
 *                 message: { type: string }
 *                 statusCode: { type: integer, example: 409 }
 *       500:
 *         description: 서버 오류
 */
router.post("/register/business", authenticateJwt, registerBusiness);

/**
 * @swagger
 * /api/settlements/sales/monthly:
 *   get:
 *     summary: 월별 판매 내역 조회
 *     description: 로그인한 판매자의 특정 연-월에 발생한 판매(Settlement) 내역을 조회합니다. year/month 미지정 시 현재 UTC 기준 년/월을 사용합니다.
 *     tags:
 *       - Settlement
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer, example: 2026 }
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12, example: 5 }
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 월별 판매 내역 조회 성공 }
 *                 year: { type: integer, example: 2026 }
 *                 month: { type: integer, example: 5 }
 *                 summary:
 *                   type: object
 *                   properties:
 *                     count: { type: integer, example: 3 }
 *                     total_sales: { type: integer, description: 원래 판매가 합계 (환불 포함), example: 30000 }
 *                     total_settled: { type: integer, description: net 정산 금액 (환불 제외), example: 18000 }
 *                     total_fee: { type: integer, example: 3000 }
 *                     refunded_count: { type: integer, example: 1 }
 *                     refunded_amount: { type: integer, example: 9000 }
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       settlement_id: { type: integer }
 *                       sold_at: { type: string, format: date-time }
 *                       prompt_id: { type: integer }
 *                       prompt_title: { type: string }
 *                       buyer_id: { type: integer }
 *                       buyer_nickname: { type: string, nullable: true }
 *                       pay_type: { type: string, nullable: true }
 *                       card_name: { type: string, nullable: true }
 *                       sale_price: { type: integer }
 *                       settled_amount: { type: integer }
 *                       fee: { type: integer }
 *                       status: { type: string, enum: [Pending, Succeed, Failed, Refunded] }
 *                 statusCode: { type: integer, example: 200 }
 *       400:
 *         description: 잘못된 year/month
 *       401:
 *         description: 로그인 필요
 */
/**
 * @swagger
 * /api/settlements/pending-amount:
 *   get:
 *     summary: 정산 예정 금액 조회 (대시보드)
 *     description: |
 *       로그인한 판매자의 정산 예정 금액(Settlement.status='Pending'인 행의 amount 합계)을 조회합니다.
 *       정산관리 화면 상단 대시보드에 노출.
 *
 *       ⚠️ 현재 코드에는 Settlement.status를 'Succeed'로 업데이트하는 정산 완료 처리 흐름이 없어서,
 *       모든 미정산 거래의 누계가 반환됩니다. 별도 이슈에서 Payple 정산내역 조회와 연동한 동기화 흐름이 구현된 뒤에는
 *       실제 정산 예정분만 반환됩니다.
 *     tags: [Settlement]
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
 *                 message: { type: string, example: 정산 예정 금액 조회 성공 }
 *                 pending_amount: { type: integer, example: 125000 }
 *                 pending_count: { type: integer, example: 3 }
 *                 statusCode: { type: integer, example: 200 }
 *       401:
 *         description: 로그인 필요
 */
router.get("/pending-amount", authenticateJwt, getPendingAmount);

router.get("/sales/monthly", authenticateJwt, getMonthlySales);

/**
 * @swagger
 * /api/settlements/yearly:
 *   get:
 *     summary: 연도별 누적 정산 내역 조회
 *     description: 로그인한 판매자의 연도별 누적 정산 합계를 조회합니다.
 *     tags:
 *       - Settlement
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
 *                 message: { type: string, example: 연도별 누적 정산 내역 조회 성공 }
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year: { type: integer, example: 2026 }
 *                       count: { type: integer, example: 50 }
 *                       total_sales: { type: integer, description: gross — 환불 포함, example: 500000 }
 *                       total_settled: { type: integer, description: net — Succeed 합계 (환불 제외), example: 400000 }
 *                       total_fee: { type: integer, example: 50000 }
 *                       succeeded_amount: { type: integer, example: 400000 }
 *                       pending_amount: { type: integer, example: 50000 }
 *                       refunded_amount: { type: integer, example: 50000 }
 *                       refunded_count: { type: integer, example: 5 }
 *                 statusCode: { type: integer, example: 200 }
 *       401:
 *         description: 로그인 필요
 */
router.get("/yearly", authenticateJwt, getYearlySettlements);

export default router;
