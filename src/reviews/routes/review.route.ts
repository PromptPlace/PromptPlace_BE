import express from 'express';
import { authenticateJwt } from '../../config/passport';
import { 
    getReviewsByPromptId,
    postReview,
    deleteReview,
    getReviewEditData,
    editReview,
    getReviewsWrittenByMe,
    getMyReceivedReviews,
} from '../controllers/review.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: 프롬프트 리뷰 관련 API
 */

/**
 * @swagger
 * /api/reviews/me:
 *   get:
 *     summary: 내가 작성한 리뷰 목록 조회
 *     description: |
 *       ### API 설명
 *       
 *       - 커서 기반 페이지네이션(cursor-based-pagination) 사용  
 *       - `cursor`는 이전 요청에서 받은 마지막 리뷰의 ID를 의미하며, 이를 기준으로 이후 데이터를 조회  
 *       - 첫 요청 시에는 `cursor`를 생략하여 최신 리뷰부터 조회  
 *       - `has_more` 속성으로 더 불러올 데이터가 있는지 미리 확인 가능
 *       
 *       ### Query String
 *       | 항목     | 설명                                      | 예시                         | 필수 여부                |
 *       |----------|-------------------------------------------|------------------------------|--------------------------|
 *       | cursor   | 마지막으로 조회된 리뷰 ID (처음 요청 시 생략 가능) | `cursor=70`<br>(예: id=80~70까지 받았으면 다음 요청에 cursor=70) | ❌ (첫 요청 시 생략 가능) |
 *       | limit    | 가져올 리뷰 수                              | `limit=7`                    | ❌ (기본값: 10)           |
 *     tags: [Reviews]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *         description: 마지막으로 조회된 리뷰 ID (커서 기반 페이지네이션)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 가져올 리뷰 수
 *     responses:
 *       200:
 *         description: 내가 작성한 리뷰 목록을 성공적으로 불러왔습니다.
 *         content:
 *           application/json:
 *             example:
 *               message: 내가 작성한 리뷰 목록을 성공적으로 불러왔습니다.
 *               data:
 *                 statusCode: 200
 *                 reviews:
 *                   - review_id: 10
 *                     prompt_id: 5
 *                     prompt_title: 프롬프트 3
 *                     rating: 4.5
 *                     content: 너무 유용했어요!
 *                     created_at: "2025-07-25T04:39:21.000Z"
 *                     updated_at: "2025-07-25T07:32:34.821Z"
 *                   - review_id: 7
 *                     prompt_id: 5
 *                     prompt_title: 프롬프트 3
 *                     rating: 3.5
 *                     content: 좋긴 한데 약간 아쉬운 부분도 있었어요.
 *                     created_at: "2025-07-23T13:19:06.000Z"
 *                     updated_at: "2025-07-23T13:19:06.000Z"
 *                   - review_id: 6
 *                     prompt_id: 5
 *                     prompt_title: 프롬프트 3
 *                     rating: 4.5
 *                     content: 이 프롬프트는 정말 유용했어요!
 *                     created_at: "2025-07-23T13:19:06.000Z"
 *                     updated_at: "2025-07-23T13:19:06.000Z"
 *                 has_more: false
 *               statusCode: 200
 */
router.get('/me', authenticateJwt, getReviewsWrittenByMe); // 내가 작성한 리뷰 목록 조회

/**
 * @swagger
 * /api/reviews/received-reviews/me:
 *   get:
 *     summary: 내가 받은 리뷰 목록 조회
 *     tags: [Reviews]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 내가 받은 리뷰 목록을 성공적으로 불러왔습니다.
 */
router.get('/received-reviews/me', authenticateJwt, getMyReceivedReviews); // 내가 받은 리뷰 목록 조회

/**
 * @swagger
 * /api/reviews/{promptId}:
 *   get:
 *     summary: 특정 프롬프트의 리뷰 목록 조회
 *     tags: [Reviews]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: promptId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 프롬프트 ID
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *         description: 페이지네이션 커서
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 조회할 개수
 *     responses:
 *       200:
 *         description: 특정 프롬프트 리뷰 목록을 성공적으로 불러왔습니다.
 */
router.get('/:promptId', authenticateJwt, getReviewsByPromptId); // 특정 프롬프트 리뷰 목록 조회

/**
 * @swagger
 * /api/reviews/{promptId}:
 *   post:
 *     summary: 리뷰 작성
 *     tags: [Reviews]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: promptId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 리뷰를 작성할 프롬프트 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - content
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: 리뷰가 성공적으로 등록되었습니다.
 */
router.post('/:promptId', authenticateJwt, postReview); // 특정 프롬프트에 대한 리뷰 작성

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: 리뷰 삭제
 *     tags: [Reviews]
 *     security:
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 리뷰 ID
 *     responses:
 *       200:
 *         description: 리뷰가 성공적으로 삭제되었습니다.
 */
router.delete('/:reviewId', authenticateJwt, deleteReview); // 리뷰 삭제

/**
 * @swagger
 * /api/reviews/{reviewId}/edit:
 *   get:
 *     summary: 리뷰 수정 화면 데이터 조회
 *     tags: [Reviews]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 리뷰 수정 화면 데이터를 성공적으로 불러왔습니다.
 */
router.get('/:reviewId/edit', authenticateJwt, getReviewEditData);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   patch:
 *     summary: 리뷰 수정
 *     tags: [Reviews]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 리뷰 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - content
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 리뷰가 성공적으로 수정되었습니다.
 */
router.patch('/:reviewId', authenticateJwt, editReview);


export default router;
