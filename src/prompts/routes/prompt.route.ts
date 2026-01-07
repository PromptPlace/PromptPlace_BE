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
router.post("/searches", promptController.searchPrompts);

/**
 * @swagger
 * /api/prompts:
 *   get:
 *     summary: 프롬프트 전체 조회
 *     description: 모든 프롬프트 목록을 조회합니다. JWT 인증이 필요합니다.
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프롬프트 전체 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               message: "프롬프트 전체 조회 성공"
 *               data:
 *                 - prompt_id: 3
 *                   user_id: 1
 *                   title: "프롬프트 1"
 *                   prompt: "프롬프트 입력 1"
 *                   prompt_result: "프롬프트 결과 1"
 *                   has_image: true
 *                   description: "설명 1"
 *                   usage_guide: "사용 가이드 1"
 *                   price: 0
 *                   is_free: true
 *                   downloads: 0
 *                   views: 0
 *                   likes: 0
 *                   review_counts: 0
 *                   rating_avg: 0
 *                   created_at: "2025-07-20T16:51:42.632Z"
 *                   updated_at: "2025-07-20T16:51:42.632Z"
 *                   inactive_date: null
 
 *                   user:
 *                     user_id: 1
 *                     nickname: "류민주"
 *                     profileImage: null
 *                   models:
 *                     - promptmodel_id: 1
 *                       prompt_id: 3
 *                       model_id: 1
 *                       model:
 *                         name: "모델 이름 1"
 *                   tags:
 *                     - prompttag_id: 1
 *                       prompt_id: 3
 *                       tag_id: 1
 *                       tag:
 *                         tag_id: 1
 *                         name: "태그 1"
 *                   images:
 *                     - image_url: "https://example.com/image1.jpg"
 *                     - image_url: "https://promptplace-s3.s3.ap-northeast-2.amazonaws.com/promptimages/7d53a160-db18-4deb-8437-744f2fc1005e_promptplace.png"
 *                 - prompt_id: 4
 *                   user_id: 2
 *                   title: "프롬프트 2"
 *                   prompt: "프롬프트 입력 2"
 *                   prompt_result: "프롬프트 결과 2"
 *                   has_image: false
 *                   description: "설명 2"
 *                   usage_guide: "사용 가이드 2"
 *                   price: 1000
 *                   is_free: false
 *                   downloads: 10
 *                   views: 100
 *                   likes: 5
 *                   review_counts: 0
 *                   rating_avg: 0
 *                   created_at: "2025-07-20T16:51:42.723Z"
 *                   updated_at: "2025-07-20T16:51:42.723Z"
 *                   inactive_date: null
 
 *                   user:
 *                     user_id: 2
 *                     nickname: "원종호"
 *                     profileImage: null
 *                   models:
 *                     - promptmodel_id: 2
 *                       prompt_id: 4
 *                       model_id: 2
 *                       model:
 *                         name: "모델 이름 2"
 *                   tags:
 *                     - prompttag_id: 2
 *                       prompt_id: 4
 *                       tag_id: 2
 *                       tag:
 *                         tag_id: 2
 *                         name: "태그 2"
 *                   images:
 *                     - image_url: "https://example.com/image2.jpg"
 *       400:
 *         description: 잘못된 요청
 */
//프롬프트 전체 조회 API
router.get("/", promptController.getAllPrompts);

/**
 * @swagger
 * /api/prompts/{promptId}/details:
 *   get:
 *     summary: 프롬프트 상세 조회
 *     description: 특정 프롬프트의 상세 정보를 조회합니다. JWT 인증이 필요합니다.
 *     tags: [Prompts]
 *     security:
 *     parameters:
 *       - in: path
 *         name: promptId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 프롬프트 ID
 *     responses:
 *       200:
 *         description: 프롬프트 상세 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               message: "프롬프트 상세 조회 성공"
 *               data:
 *                 title: "프롬프트 2"
 *                 prompt: "프롬프트 입력 2"
 *                 prompt_result: "프롬프트 결과 2"
 *                 has_image: false
 *                 description: "설명 2"
 *                 usage_guide: "사용 가이드 2"
 *                 price: 1000
 *                 is_free: false
 *                 tags:
 *                   - tag_id: 2
 *                     name: "태그 2"
 *                 models:
 *                   - "모델 이름 2"
 *                 images:
 *                   - "https://example.com/image2.jpg"
 *                 writer:
 *                   user_id: 2
 *                   nickname: "원종호"
 *                   profile_image_url: null
 *       400:
 *         description: 잘못된 요청
 */
//프롬프트 상세 조회 API
router.get(
  "/:promptId/details",
  promptController.getPromptDetails
);

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
 * /api/prompts/{promptId}/images:
 *   patch:
 *     summary: 프롬프트 이미지 순서 변경
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
 *               - order_index
 *     responses:
 *       200:
 *         description: 이미지 순서 변경 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 이미지를 찾을 수 없음
 */
router.patch(
  "/:promptId/images",
  authenticateJwt,
  promptController.updatePromptImage
);

/**
 * @swagger
 * /api/prompts/{promptId}/images:
 *   delete:
 *     summary: 프롬프트 이미지 삭제
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
 *               order_index:
 *                 type: integer
 *             required:
 *               - order_index
 *     responses:
 *       200:
 *         description: 이미지 삭제 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 이미지를 찾을 수 없음
 */
router.delete(
  "/:promptId/images",
  authenticateJwt,
  promptController.deletePromptImage
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
 *               - models
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
 *               models:
 *                 type: array
 *                 items:
 *                   type: string
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
 *               models:
 *                 type: array
 *                 items:
 *                   type: string
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
router.patch("/:promptId", authenticateJwt, promptController.updatePrompt);

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
router.delete("/:promptId", authenticateJwt, promptController.deletePrompt);

/**
 * @swagger
 * /api/prompts/categories:
 *   get:
 *     summary: 카테고리 목록 조회
 *     description: 모든 카테고리를 대분류별로 그룹화하여 조회합니다.
 *     tags: [Prompts]
 *     responses:
 *       200:
 *         description: 카테고리 조회 성공
 */
router.get("/categories", promptController.getGroupedCategories);

/**
 * @swagger
 * /api/prompts/models:
 *   get:
 *     summary: 모델 목록 조회
 *     description: 모든 모델을 분류별로 그룹화하여 조회합니다.
 *     tags: [Prompts]
 *     responses:
 *       200:
 *         description: 모델 조회 성공
 */
router.get("/models", promptController.getGroupedModels);


export default router;
