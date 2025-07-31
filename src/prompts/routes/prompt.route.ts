import { Router } from "express";
import * as promptController from "../controllers/prompt.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Prompts
 *   description: 프롬프트 관련 API
 */

/**
 * @swagger
 * /api/prompts/searches:
 *   get:
 *     summary: 프롬프트 검색
 *     description: 키워드, 태그, 모델 등을 기준으로 프롬프트를 검색합니다.
 *     tags: [Prompts]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         description: 검색어
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         description: 태그 (여러 개 가능)
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: model
 *         description: 모델 이름
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent, views, popular]
 *           default: recent
 *       - in: query
 *         name: is_free
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: 검색 성공
 *       400:
 *         description: 잘못된 요청
 */
// 프롬프트 검색 API
router.get("/searches", promptController.searchPrompts);

//프롬프트 상세 조회 API
router.get("/:promptId/details", authenticateJwt, promptController.getPromptDetails);

// S3 presign url 발급 API
router.post("/presign-url", authenticateJwt, promptController.presignUrl);

/**
 * @swagger
 * /api/prompts/{promptId}/images:
 *   post:
 *     summary: 프롬프트에 이미지 등록
 *     tags: [Prompts]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: promptId
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
 *               image_url:
 *                 type: string
 *               order_index:
 *                 type: integer
 *             required:
 *               - image_url
 *     responses:
 *       201:
 *         description: 이미지 매핑 성공
 *       400:
 *         description: 필수 값 누락
 *       401:
 *         description: 인증 실패
 */
// 프롬프트 이미지 매핑 API
router.post(
  "/:promptId/images",
  authenticateJwt,
  promptController.createPromptImage
);

/**
 * @swagger
 * /api/prompts:
 *   post:
 *     summary: 프롬프트 작성
 *     tags: [Prompts]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - prompt
 *               - prompt_result
 *               - description
 *               - price
 *               - tags
 *               - model
 *               - is_free
 *             properties:
 *               title:
 *                 type: string
 *               prompt:
 *                 type: string
 *               prompt_result:
 *                 type: string
 *               description:
 *                 type: string
 *               usage_guide:
 *                 type: string
 *               price:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               model:
 *                 type: string
 *               is_free:
 *                 type: boolean
 *               has_image:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: 업로드 성공
 *       400:
 *         description: 필수 필드 누락
 *       401:
 *         description: 인증 실패
 */
// 프롬프트 업로드(작성) API
router.post("/", authenticateJwt, promptController.createPrompt);

/**
 * @swagger
 * /api/prompts/{promptId}:
 *   patch:
 *     summary: 프롬프트 수정
 *     tags: [Prompts]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: promptId
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
 *               title:
 *                 type: string
 *               prompt:
 *                 type: string
 *               prompt_result:
 *                 type: string
 *               description:
 *                 type: string
 *               usage_guide:
 *                 type: string
 *               price:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               model:
 *                 type: string
 *               is_free:
 *                 type: boolean
 *               has_image:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 수정 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 프롬프트 없음
 */
// 프롬프트 수정 API
router.patch('/:promptId', authenticateJwt, promptController.updatePrompt);

/**
 * @swagger
 * /api/prompts/{promptId}:
 *   delete:
 *     summary: 프롬프트 삭제
 *     tags: [Prompts]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: promptId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 프롬프트 없음
 */
// 프롬프트 삭제 API
router.delete('/:promptId', authenticateJwt, promptController.deletePrompt);

export default router;
