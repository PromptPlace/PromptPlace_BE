import { Router } from "express";
import { verifyAccount, ViewAccount } from "../controllers/settlement.account.controller";
import { registerIndividual, registerBusiness } from "../controllers/settlement.seller.controller";
import { uploadLicense } from "../controllers/settlement.seller.controller";
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
 *                       example: 필수 입력값(생년월일, 은행, 계좌번호, 실명/대표자명, 예금주명)이 모두 입력되지 않았습니다.
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

/**
 * @swagger
 * /api/settlements/accounts:
 *   get:
 *     summary: 등록된 정산 계좌 정보 조회
 *     description: 현재 로그인한 사용자의 정산용 계좌 정보(은행, 계좌번호, 예금주명)를 조회합니다.
 *     tags:
 *       - Settlement
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
 *                   example: 계좌 정보 조회가 완료되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     bank:
 *                       type: string
 *                       example: KOOKMIN
 *                     accountNumber:
 *                       type: string
 *                       example: "1234567890"
 *                     holderName:
 *                       type: string
 *                       example: 홍길동
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
 *       404:
 *         description: 계좌 정보 없음 - 등록된 계좌가 없는 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: AccountNotFound
 *                 message:
 *                   type: string
 *                   example: 등록된 계좌 정보가 존재하지 않습니다.
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
router.get("/accounts", authenticateJwt, ViewAccount);

/**
 * @swagger
 * /api/settlements/register/individual:
 *   post:
 *     summary: 개인 판매자 등록 및 정보 수정
 *     description: 개인정보 수집 이용 동의 및 계좌 정보를 입력받아 일반 개인 판매자로 등록하거나 판매자 정보를 수정합니다. (일일 계좌 인증 5회 제한)
 *     tags:
 *       - Settlement
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
 *               - birthDate
 *               - bank
 *               - accountNumber
 *               - holderName
 *               - isTermsAgreed
 *             properties:
 *               name:
 *                 type: string
 *                 description: 실명
 *                 example: 홍길동
 *               birthDate:
 *                 type: string
 *                 description: 예금주 생년월일 6자리 (YYMMDD)
 *                 example: "880212"
 *               bank:
 *                 type: string
 *                 description: 페이플 금융기관 3자리 숫자 코드
 *                 example: "004"
 *               accountNumber:
 *                 type: string
 *                 description: '-'를 제외한 계좌 번호
 *                 example: "1234567890"
 *               holderName:
 *                 type: string
 *                 description: 계좌 예금주명
 *                 example: 홍길동
 *               isTermsAgreed:
 *                 type: boolean
 *                 description: 개인정보 수집 이용 동의 여부 (반드시 true)
 *                 example: true
 *     responses:
 *       200:
 *         description: 판매자 등록 및 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *             examples:
 *               CreateSuccess:
 *                 summary: 신규 등록 성공
 *                 value:
 *                   message: 개인 판매자 등록이 완료되었습니다.
 *                   statusCode: 200
 *               UpdateSuccess:
 *                 summary: 기존 정보 수정 성공
 *                 value:
 *                   message: 판매자 정보가 성공적으로 수정되었습니다.
 *                   statusCode: 200
 *       400:
 *         description: 검증 실패 또는 계좌 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 에러 코드 (ValidationError 또는 AccountVerificationError)
 *                 subCode:
 *                   type: string
 *                   description: 계좌 인증 실패 상세 코드 (프론트엔드 모달 분기용)
 *                 message:
 *                   type: string
 *                   description: 에러 상세 메시지
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *             examples:
 *               validationError:
 *                 summary: 필수 입력값 누락
 *                 value:
 *                   error: ValidationError
 *                   message: 필수 입력값이 누락되었거나 이용 약관에 동의하지 않았습니다.
 *                   statusCode: 400
 *               nameMismatch:
 *                 summary: [모달 1] 예금주명 불일치
 *                 value:
 *                   error: AccountVerificationError
 *                   subCode: NAME_MISMATCH
 *                   message: 실명과 예금주명이 일치하는지 다시 확인해주세요.
 *                   statusCode: 400
 *               bankMismatch:
 *                 summary: [모달 2] 은행 불일치
 *                 value:
 *                   error: AccountVerificationError
 *                   subCode: BANK_MISMATCH
 *                   message: 선택하신 은행과 계좌번호가 일치하지 않습니다. 은행명을 다시 확인해 주세요.
 *                   statusCode: 400
 *               accountNotFound:
 *                 summary: [모달 3] 없는 계좌
 *                 value:
 *                   error: AccountVerificationError
 *                   subCode: ACCOUNT_NOT_FOUND
 *                   message: 해당 계좌는 존재하지 않는 계좌입니다. 다시 확인해주세요.
 *                   statusCode: 400
 *               accountRestricted:
 *                 summary: [모달 4] 거래 불가 계좌 (정지/해약 등)
 *                 value:
 *                   error: AccountVerificationError
 *                   subCode: ACCOUNT_RESTRICTED
 *                   message: 입력하신 계좌는 현재 정상적인 거래가 불가능한 상태(해약/사고/정지)입니다. 은행 확인 후 다시 시도해 주세요.
 *                   statusCode: 400
 *               unsupportedType:
 *                 summary: [모달 5] 지원하지 않는 계좌 (가상계좌 등)
 *                 value:
 *                   error: AccountVerificationError
 *                   subCode: UNSUPPORTED_TYPE
 *                   message: 해당 계좌는 정산용으로 등록할 수 없는 유형입니다. 원화 입출금이 가능한 보통예금 계좌로 다시 시도해 주세요.
 *                   statusCode: 400
 *               bankTimeout:
 *                 summary: [모달 6] 타행 통신 오류/지연
 *                 value:
 *                   error: AccountVerificationError
 *                   subCode: BANK_TIMEOUT
 *                   message: 해당 은행과의 통신이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.
 *                   statusCode: 400
 *               bankMaintenance:
 *                 summary: [모달 7] 은행 점검 시간
 *                 value:
 *                   error: AccountVerificationError
 *                   subCode: BANK_MAINTENANCE
 *                   message: 현재 은행 정기 점검 시간(가능시간 : 01시 ~ 23시)입니다. 점검 종료 후 다시 시도해 주세요.
 *                   statusCode: 400
 *               limitExceeded:
 *                 summary: [모달 8] 일일 인증 횟수 초과
 *                 value:
 *                   error: AccountVerificationError
 *                   subCode: LIMIT_EXCEEDED
 *                   message: 일일 계좌 인증 횟수를 초과했습니다. 보안을 위해 내일 다시 시도해 주세요.
 *                   statusCode: 400
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
 *                   example: 서버 오류가 발생했습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */
router.post("/register/individual", authenticateJwt, registerIndividual);

/**
 * @swagger
 * /api/settlements/upload/business-license:
 *   post:
 *     summary: 사업자등록증 업로드 (개인/법인 사업자)
 *     description: 개인 또는 법인 사업자의 사업자등록증 파일(이미지 또는 PDF, 최대 20MB)을 업로드하고 S3 URL을 반환받습니다.
 *     tags:
 *       - Settlement
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 사업자등록증 파일 (jpg, jpeg, png, pdf) / 최대 20MB
 *     responses:
 *       200:
 *         description: 파일 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 사업자등록증 업로드가 완료되었습니다.
 *                 fileUrl:
 *                   type: string
 *                   example: https://promptplace-storage.s3.ap-northeast-2.amazonaws.com/business-licenses/123-1709865432123.jpg
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: 업로드할 파일 누락
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: ValidationError
 *                 message:
 *                   type: string
 *                   example: 업로드할 파일이 첨부되지 않았습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
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
 *       413:
 *         description: 파일 용량 제한 초과 (20MB)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: FileTooLarge
 *                 message:
 *                   type: string
 *                   example: 파일 크기는 최대 20MB까지만 허용됩니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 413
 *       415:
 *         description: 지원하지 않는 파일 형식
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: InvalidFileType
 *                 message:
 *                   type: string
 *                   example: 지원하지 않는 파일 형식입니다. (jpg, jpeg, png, pdf만 가능)
 *                 statusCode:
 *                   type: integer
 *                   example: 415
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
 *                   example: 서버 오류가 발생했습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */
router.post("/upload/business-license", authenticateJwt, uploadLicense);

/**
 * @swagger
 * /api/settlements/register/business:
 *   post:
 *     summary: 사업자 판매자 등록
 *     description: 개인/법인 사업자의 정보와 사업자등록증 URL을 입력받아 판매자로 등록 신청합니다. (관리자 승인 대기 상태로 저장됨)
 *     tags:
 *       - Settlement
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - representativeName
 *               - bank
 *               - accountNumber
 *               - holderName
 *               - businessNumber
 *               - companyName
 *               - businessLicenseUrl
 *               - isTermsAgreed
 *             properties:
 *               representativeName:
 *                 type: string
 *                 description: 대표자명
 *                 example: 김대표
 *               bank:
 *                 type: string
 *                 description: 포트원 표준 은행 코드
 *                 example: SHINHAN
 *               accountNumber:
 *                 type: string
 *                 description: '-'를 제외한 계좌 번호
 *                 example: "0987654321"
 *               holderName:
 *                 type: string
 *                 description: 계좌 예금주명
 *                 example: 김대표
 *               businessNumber:
 *                 type: string
 *                 description: 사업자등록번호 ('-' 제외 숫자만)
 *                 example: "1234567890"
 *               companyName:
 *                 type: string
 *                 description: 상호명
 *                 example: (주)프롬프트팩토리
 *               businessLicenseUrl:
 *                 type: string
 *                 description: 업로드 API로 발급받은 사업자등록증 이미지 URL
 *                 example: https://promptplace-storage.s3.ap-northeast-2.amazonaws.com/business-licenses/123-1709865432123.jpg
 *               isTermsAgreed:
 *                 type: boolean
 *                 description: 개인정보 수집 이용 동의 여부 (반드시 true)
 *                 example: true
 *     responses:
 *       200:
 *         description: 판매자 신청 성공 (승인 대기 상태)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 사업자 판매자 신청이 완료되었습니다. 관리자 승인 후 최종 등록됩니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: 검증 실패 - 필수 입력값 누락 또는 약관 미동의
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: ValidationError
 *                 message:
 *                   type: string
 *                   example: 필수 입력값이 누락되었거나 이용 약관에 동의하지 않았습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
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
 *       409:
 *         description: 충돌 - 중복된 사업자등록번호 또는 이미 등록된 유저
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: DuplicateBusinessNumber
 *                     message:
 *                       type: string
 *                       example: 이미 등록되었거나 심사 대기 중인 사업자등록번호입니다.
 *                     statusCode:
 *                       type: integer
 *                       example: 409
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: AlreadyRegistered
 *                     message:
 *                       type: string
 *                       example: 이미 판매자로 등록되었거나 승인 심사 대기 중인 회원입니다.
 *                     statusCode:
 *                       type: integer
 *                       example: 409
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
 *                   example: 서버 오류가 발생했습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */
router.post("/register/business", authenticateJwt, registerBusiness);

export default router;