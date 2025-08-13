"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const member_controller_1 = require("../controllers/member.controller");
const passport_1 = require("../../config/passport");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
const memberController = new member_controller_1.MemberController();
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
router.get("/followers/:memberId", passport_1.authenticateJwt, memberController.getFollowers.bind(memberController));
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
router.get("/following/:memberId", passport_1.authenticateJwt, memberController.getFollowings.bind(memberController));
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
router.get("/:memberId/prompts", memberController.getMemberPrompts.bind(memberController));
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
router.get("/:memberId", passport_1.authenticateJwt, memberController.getMemberById.bind(memberController));
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
router.patch("/", passport_1.authenticateJwt, memberController.updateMember.bind(memberController));
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
router.post("/intros", passport_1.authenticateJwt, memberController.createOrUpdateIntro.bind(memberController));
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
router.patch("/intros", passport_1.authenticateJwt, memberController.updateIntro.bind(memberController));
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
router.post("/histories", passport_1.authenticateJwt, memberController.createHistory.bind(memberController));
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
router.patch("/histories/:historyId", passport_1.authenticateJwt, memberController.updateHistory.bind(memberController));
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
router.delete("/histories/:historyId", passport_1.authenticateJwt, memberController.deleteHistory.bind(memberController));
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
router.get("/:memberId/histories", passport_1.authenticateJwt, memberController.getHistories.bind(memberController));
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
router.post("/sns", passport_1.authenticateJwt, memberController.createSns.bind(memberController));
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
router.patch("/sns/:snsId", passport_1.authenticateJwt, memberController.updateSns.bind(memberController));
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
router.delete("/sns/:snsId", passport_1.authenticateJwt, memberController.deleteSns.bind(memberController));
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
router.get("/:memberId/sns", passport_1.authenticateJwt, memberController.getSnsList.bind(memberController));
/**
 * @swagger
 * /api/members/images:
 *   post:
 *     summary: 프로필 이미지 업로드
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
 *     responses:
 *       200:
 *         description: 업로드 성공
 */
// 회원 프로필 이미지 등록 API
router.post("/images", passport_1.authenticateJwt, upload_1.upload.single("profile_image"), memberController.uploadProfileImage.bind(memberController));
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
router.post("/follows/:memberId", passport_1.authenticateJwt, memberController.followMember.bind(memberController));
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
router.delete("/follows/:memberId", passport_1.authenticateJwt, memberController.unfollowMember.bind(memberController));
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
router.delete("/withdrawl", passport_1.authenticateJwt, memberController.withdrawMember.bind(memberController));
exports.default = router;
