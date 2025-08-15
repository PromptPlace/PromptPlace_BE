import { Router } from "express";
import { MemberController } from "../controllers/member.controller";
import { authenticateJwt } from "../../config/passport";
import { upload } from "../../middlewares/upload";

const router = Router();
const memberController = new MemberController();

/**
 * @swagger
 * tags:
 *   - name: Member
 *     description: 회원 관련 API
 */

/**
 * @swagger
 * /api/members/followers/{memberId}:
 *   get:
 *     summary: 회원의 팔로워 목록 조회
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 회원 ID
 *     responses:
 *       200:
 *         description: 팔로워 목록 조회 성공
 */
router.get(
  "/followers/:memberId",
  authenticateJwt,
  memberController.getFollowers.bind(memberController)
);

/**
 * @swagger
 * /api/members/following/{memberId}:
 *   get:
 *     summary: 회원의 팔로잉 목록 조회
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 회원 ID
 *     responses:
 *       200:
 *         description: 팔로잉 목록 조회 성공
 */
router.get(
  "/following/:memberId",
  authenticateJwt,
  memberController.getFollowings.bind(memberController)
);

/**
 * @swagger
 * /api/members/{memberId}/prompts:
 *   get:
 *     summary: 회원이 작성한 프롬프트 목록 조회
 *     tags: [Member]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: integer
 *         description: 페이징 커서
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: 한 페이지에 가져올 개수 (최대 50)
 *     responses:
 *       200:
 *         description: 프롬프트 목록 조회 성공
 */
// 특정 회원의 프롬프트 목록 조회 API
router.get(
  "/:memberId/prompts",
  memberController.getMemberPrompts.bind(memberController)
);

/**
 * @swagger
 * /api/members/{memberId}:
 *   get:
 *     summary: 회원 정보 조회
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 회원 정보 반환
 */
// 특정 회원 정보 조회 API
router.get(
  "/:memberId",
  authenticateJwt,
  memberController.getMemberById.bind(memberController)
);

/**
 * @swagger
 * /api/members:
 *   patch:
 *     summary: 회원 정보 수정
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: 회원 정보 수정 성공
 */
// 회원 정보 수정 API
router.patch(
  "/",
  authenticateJwt,
  memberController.updateMember.bind(memberController)
);

/**
 * @swagger
 * /api/members/intros:
 *   post:
 *     summary: 회원 한 줄 소개 작성 또는 수정
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "프롬프트 전문가입니다."
 *     responses:
 *       200:
 *         description: 소개 작성/수정 성공
 */
// 회원 한줄 소개 작성/수정 API
router.post(
  "/intros",
  authenticateJwt,
  memberController.createOrUpdateIntro.bind(memberController)
);

/**
 * @swagger
 * /api/members/intros:
 *   patch:
 *     summary: 회원 한줄 소개 수정
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "GPT 전문가입니다."
 *     responses:
 *       200:
 *         description: 한줄 소개 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 한줄 소개가 성공적으로 수정되었습니다.
 *                 intro:
 *                   type: string
 *                   example: GPT 전문가입니다.
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
// 회원 한줄 소개 수정 API
router.patch(
  "/intros",
  authenticateJwt,
  memberController.updateIntro.bind(memberController)
);

/**
 * @swagger
 * /api/members/histories:
 *   post:
 *     summary: 회원 이력 작성
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               history:
 *                 type: string
 *                 example: "2020~2023 GPT 연구소 재직"
 *     responses:
 *       201:
 *         description: 이력 작성 성공
 */
// 회원 이력 작성 API
router.post(
  "/histories",
  authenticateJwt,
  memberController.createHistory.bind(memberController)
);

/**
 * @swagger
 * /api/members/histories/{historyId}:
 *   patch:
 *     summary: 회원 이력 수정
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: historyId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               history:
 *                 type: string
 *     responses:
 *       200:
 *         description: 이력 수정 성공
 */
// 회원 이력 수정 API
router.patch(
  "/histories/:historyId",
  authenticateJwt,
  memberController.updateHistory.bind(memberController)
);

/**
 * @swagger
 * /api/members/histories/{historyId}:
 *   delete:
 *     summary: 회원 이력 삭제
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: historyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 이력 삭제 성공
 */
// 회원 이력 삭제 API
router.delete(
  "/histories/:historyId",
  authenticateJwt,
  memberController.deleteHistory.bind(memberController)
);

/**
 * @swagger
 * /api/members/{memberId}/histories:
 *   get:
 *     summary: 특정 회원의 이력 목록 조회
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 이력 목록 조회 성공
 */
// 회원 이력 조회 API
router.get(
  "/:memberId/histories",
  authenticateJwt,
  memberController.getHistories.bind(memberController)
);

/**
 * @swagger
 * /api/members/sns:
 *   post:
 *     summary: SNS 등록
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: SNS 등록 성공
 */
// 회원 SNS 작성 API
router.post(
  "/sns",
  authenticateJwt,
  memberController.createSns.bind(memberController)
);

/**
 * @swagger
 * /api/members/sns/{snsId}:
 *   patch:
 *     summary: SNS 수정
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: snsId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: SNS 수정 성공
 */
// 회원 SNS 수정 API
router.patch(
  "/sns/:snsId",
  authenticateJwt,
  memberController.updateSns.bind(memberController)
);

/**
 * @swagger
 * /api/members/sns/{snsId}:
 *   delete:
 *     summary: SNS 삭제
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: snsId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: SNS 삭제 성공
 */
// 회원 SNS 삭제 API
router.delete(
  "/sns/:snsId",
  authenticateJwt,
  memberController.deleteSns.bind(memberController)
);

/**
 * @swagger
 * /api/members/{memberId}/sns:
 *   get:
 *     summary: 회원 SNS 목록 조회
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: SNS 목록 조회 성공
 */
// 회원 SNS 목록 조회 API
router.get(
  "/:memberId/sns",
  authenticateJwt,
  memberController.getSnsList.bind(memberController)
);

/**
 * @swagger
 * /api/members/images:
 *   post:
 *     summary: 프로필 이미지 업로드 (S3)
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile_image:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 프로필 이미지 파일
 *     responses:
 *       200:
 *         description: 프로필 이미지 업로드 성공
 */
router.post(
  "/images",
  authenticateJwt,
  upload.single("profile_image"), // multer로 파일 받기
  memberController.uploadProfileImage.bind(memberController)
);

/**
 * @swagger
 * /api/members/follows/{memberId}:
 *   post:
 *     summary: 회원 팔로우
 *     description: 특정 사용자를 팔로우합니다.
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 팔로우할 대상 회원의 ID
 *     responses:
 *       201:
 *         description: 팔로우 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 팔로우 성공
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
// 회원 팔로우 API
router.post(
  "/follows/:memberId",
  authenticateJwt,
  memberController.followMember.bind(memberController)
);

/**
 * @swagger
 * /api/members/follows/{memberId}:
 *   delete:
 *     summary: 회원 언팔로우
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: 언팔로우할 회원의 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 언팔로우 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 언팔로우 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
// 회원 언팔로우 API
router.delete(
  "/follows/:memberId",
  authenticateJwt,
  memberController.unfollowMember.bind(memberController)
);

/**
 * @swagger
 * /api/members/withdrawl:
 *   delete:
 *     summary: 회원 탈퇴
 *     tags: [Member]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 탈퇴 완료
 */
// 회원 탈퇴 API
router.delete(
  "/withdrawl",
  authenticateJwt,
  memberController.withdrawMember.bind(memberController)
);

/**
 * @swagger
 * /api/members:
 *   get:
 *     summary: 전체 회원 조회 (공개)
 *     description: 홈페이지 인기 유저 표시용으로 전체 회원을 조회하는 공개 API
 *     tags: [Member]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: 페이지당 조회할 회원 수
 *     responses:
 *       200:
 *         description: 전체 회원 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 전체 회원 조회 완료
 *                 data:
 *                   type: object
 *                   properties:
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: integer
 *                             example: 1
 *                           nickname:
 *                             type: string
 *                             example: 프롬프트마스터
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T09:30:00Z"
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-02-20T14:22:00Z"
 *                           follower_cnt:
 *                             type: integer
 *                             example: 125
 *                           profile_image_url:
 *                             type: string
 *                             nullable: true
 *                             example: "https://example.com/profile.jpg"
 *                             description: 프로필 이미지 URL (없으면 null)
 *                     total:
 *                       type: integer
 *                       example: 1500
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total_pages:
 *                       type: integer
 *                       example: 75
 *                 statusCode:
 *                   type: integer
 *                   example: 200
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
// 전체 회원 조회 API (공개)
router.get("/", memberController.getAllMembers.bind(memberController));

export default router;
