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
 *     tags: [Reviews]
 *     security:
 *       - jwt: []
 *     parameters:
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
 *         description: 내가 작성한 리뷰 목록 조회 성공
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
 *         description: 내가 받은 리뷰 목록 조회 성공
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
 *         description: 리뷰 목록 조회 성공
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
 *         description: 리뷰 작성 성공
 */
router.post('/:promptId', authenticateJwt, postReview); // 특정 프롬프트에 대한 리뷰 작성

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: 리뷰 삭제
 *     tags: [Reviews]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 리뷰 ID
 *     responses:
 *       200:
 *         description: 리뷰 삭제 성공
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
 *         description: 리뷰 수정 화면 데이터 조회 성공
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
 *         description: 리뷰 수정 성공
 */
router.patch('/:reviewId', authenticateJwt, editReview);


export default router;
