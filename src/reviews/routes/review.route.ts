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
 *       | 항목    | 설명                                         | 예시                             | 필수 여부                  |
 *       |---------|----------------------------------------------|----------------------------------|----------------------------|
 *       | cursor  | 마지막으로 조회된 리뷰 ID (처음 요청 시 생략 가능) | `cursor=70`<br>(예: id=80~70이면 cursor=70) | ❌ (처음 요청 시 생략 가능) |
 *       | limit   | 가져올 리뷰 수                                 | `limit=7`                        | ❌ (기본값: 10)             |
 *       
 *       ### Header
 *       ```json
 *       {
 *         "Authorization": "Bearer {access_token}"
 *       }
 *       ```
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
 *     description: |
 *       ### API 설명
 *       
 *       - 커서 기반 페이지네이션(cursor-based-pagination) 사용  
 *       - `cursor`는 이전 요청에서 받은 마지막 리뷰의 ID를 의미하며, 이를 기준으로 이후 데이터를 조회  
 *       - 첫 요청 시에는 `cursor`를 생략하여 최신 리뷰부터 조회  
 *       - `has_more` 속성으로 더 불러올 데이터가 있는지 미리 확인 가능
 *       
 *       ### Query String
 *       | 항목    | 설명                                         | 예시                             | 필수 여부                  |
 *       |---------|----------------------------------------------|----------------------------------|----------------------------|
 *       | cursor  | 마지막으로 조회된 리뷰 ID (처음 요청 시 생략 가능) | `cursor=70`<br>(예: id=80~70이면 cursor=70) | ❌ (처음 요청 시 생략 가능) |
 *       | limit   | 가져올 리뷰 수                                 | `limit=7`                        | ❌ (기본값: 10)             |
 *       
 *       ### Header
 *       ```json
 *       {
 *         "Authorization": "Bearer {access_token}"
 *       }
 *       ```
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
 *         description: 내가 받은 리뷰 목록을 성공적으로 불러왔습니다.
 *         content:
 *           application/json:
 *             example:
 *               message: 내가 받은 리뷰 목록을 성공적으로 불러왔습니다.
 *               data:
 *                 statusCode: 200
 *                 reviews:
 *                   - review_id: 56
 *                     prompt_id: 11
 *                     prompt_title: 창의적인 아이디어 발상 프롬프트
 *                     writer_id: 12
 *                     writer_nickname: 최성준
 *                     writer_profile_image_url: uploads/1753012119706.jpg
 *                     rating: 4.9
 *                     content: 완성도가 높네요.
 *                     created_at: "2025-07-27T12:11:02.000Z"
 *                     updated_at: "2025-07-27T12:11:02.000Z"
 *                   - review_id: 55
 *                     prompt_id: 11
 *                     prompt_title: 창의적인 아이디어 발상 프롬프트
 *                     writer_id: 7
 *                     writer_nickname: 송강규
 *                     writer_profile_image_url: uploads/1753012119706.jpg
 *                     rating: 3.9
 *                     content: 조금 개선하면 더 좋을 듯.
 *                     created_at: "2025-07-27T12:11:02.000Z"
 *                     updated_at: "2025-07-27T12:11:02.000Z"
 *                   - review_id: 54
 *                     prompt_id: 11
 *                     prompt_title: 창의적인 아이디어 발상 프롬프트
 *                     writer_id: 6
 *                     writer_nickname: 류민주
 *                     writer_profile_image_url: uploads/1753012119706.jpg
 *                     rating: 4.2
 *                     content: 텍스트 생성 결과가 좋아요.
 *                     created_at: "2025-07-27T12:11:02.000Z"
 *                     updated_at: "2025-07-27T12:11:02.000Z"
 *                   - review_id: 53
 *                     prompt_id: 11
 *                     prompt_title: 창의적인 아이디어 발상 프롬프트
 *                     writer_id: 5
 *                     writer_nickname: 송강규
 *                     writer_profile_image_url: uploads/1753017046868.png
 *                     rating: 4.8
 *                     content: 문제 해결에 큰 도움이 됐습니다.
 *                     created_at: "2025-07-27T12:11:02.000Z"
 *                     updated_at: "2025-07-27T12:11:02.000Z"
 *                   - review_id: 52
 *                     prompt_id: 11
 *                     prompt_title: 창의적인 아이디어 발상 프롬프트
 *                     writer_id: 4
 *                     writer_nickname: 송강규
 *                     writer_profile_image_url: uploads/1753012119706.jpg
 *                     rating: 3.5
 *                     content: 괜찮지만 약간 단순해요.
 *                     created_at: "2025-07-27T12:11:02.000Z"
 *                     updated_at: "2025-07-27T12:11:02.000Z"
 *                 has_more: false
 *               statusCode: 200
 */

router.get('/received-reviews/me', authenticateJwt, getMyReceivedReviews); // 내가 받은 리뷰 목록 조회
/**
 * @swagger
 * /api/reviews/{promptId}:
 *   get:
 *     summary: 특정 프롬프트의 리뷰 목록 조회
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
 *       
 *       ### Path Variable
 *       | 항목       | 설명             | 예시        | 필수 여부 |
 *       |------------|------------------|-------------|-----------|
 *       | promptId   | 프롬프트 ID       | `42`        | ✅        |
 *       
 *       ### Header
 *       ```json
 *       {
 *         "Authorization": "Bearer {access_token}"
 *       }
 *       ```
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
 *         description: 마지막으로 조회된 리뷰 ID (커서 기반 페이지네이션)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 가져올 리뷰 수
 *     responses:
 *       200:
 *         description: 특정 프롬프트 리뷰 목록을 성공적으로 불러왔습니다.
 *         content:
 *           application/json:
 *             example:
 *               message: 프롬프트 리뷰 목록을 성공적으로 불러왔습니다.
 *               data:
 *                 reviews:
 *                   - review_id: 60
 *                     writer_id: 10
 *                     writer_nickname: 남아린
 *                     writer_image_url: uploads/sample_user10.jpg
 *                     rating: 4.5
 *                     content: 너무 유용했어요!
 *                     created_at: "2025-07-27T12:32:45.789Z"
 *                   - review_id: 59
 *                     writer_id: 10
 *                     writer_nickname: 남아린
 *                     writer_image_url: uploads/sample_user10.jpg
 *                     rating: 4.5
 *                     content: 너무 유용했어요!
 *                     created_at: "2025-07-27T12:31:05.849Z"
 *                 has_more: false
 *               statusCode: 200
 */

router.get('/:promptId', authenticateJwt, getReviewsByPromptId); // 특정 프롬프트 리뷰 목록 조회
/**
 * @swagger
 * /api/reviews/{promptId}:
 *   post:
 *     summary: 특정 프롬프트에 리뷰 작성
 *     description: |
 *       ### API 설명
 *       
 *       - 특정 프롬프트에 리뷰를 작성합니다.  
 *       - 로그인한 사용자만 요청 가능하며, `Authorization` 헤더를 포함해야 합니다.  
 *       - 요청 바디에는 리뷰 내용(`content`)과 평점(`rating`)이 포함되어야 합니다.
 *       
 *       ### Path Variable
 *       | 항목       | 설명                 | 예시   | 필수 여부 |
 *       |------------|----------------------|--------|-----------|
 *       | promptId   | 리뷰 작성 대상 프롬프트 ID | `5`    | ✅        |
 *       
 *       ### Request Body
 *       | 항목     | 설명       | 예시           | 필수 여부 |
 *       |----------|------------|----------------|-----------|
 *       | content  | 리뷰 내용   | 너무 유용했어요! | ✅        |
 *       | rating   | 평점 (0~5) | 4.5            | ✅        |
 *       
 *       ### Header
 *       ```json
 *       {
 *         "Authorization": "Bearer {access_token}"
 *       }
 *       ```
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
 *               - content
 *               - rating
 *             properties:
 *               content:
 *                 type: string
 *                 description: 리뷰 내용
 *                 example: 너무 유용했어요!
 *               rating:
 *                 type: number
 *                 format: float
 *                 description: 평점 (0.0 ~ 5.0)
 *                 example: 4.5
 *     responses:
 *       200:
 *         description: 리뷰가 성공적으로 등록되었습니다.
 *         content:
 *           application/json:
 *             example:
 *               message: 리뷰가 성공적으로 등록되었습니다.
 *               data:
 *                 review_id: 63
 *                 writer_id: 10
 *                 prompt_id: 5
 *                 rating: 4.5
 *                 content: 너무 유용했어요!
 *                 created_at: "2025-08-07T09:20:09.967Z"
 *               statusCode: 200
 */


router.post('/:promptId', authenticateJwt, postReview); // 특정 프롬프트에 대한 리뷰 작성

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: 특정 리뷰 삭제
 *     description: |
 *       ### API 설명
 *       
 *       - 작성자가 본인의 리뷰를 삭제할 수 있는 API입니다.  
 *       - 리뷰 작성일로부터 **30일 이내**인 경우에만 삭제가 가능합니다.  
 *       - `Authorization` 헤더를 포함한 로그인된 사용자만 접근할 수 있습니다.
 *       
 *       ### Path Variable
 *       | 항목      | 설명                | 예시   | 필수 여부 |
 *       |-----------|---------------------|--------|-----------|
 *       | reviewId  | 삭제할 리뷰 ID        | `63`   | ✅        |
 *       
 *       ### Header
 *       ```json
 *       {
 *         "Authorization": "Bearer {access_token}"
 *       }
 *       ```
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
 *         description: 리뷰가 성공적으로 삭제되었습니다.
 *         content:
 *           application/json:
 *             example:
 *               message: 리뷰가 성공적으로 삭제되었습니다.
 *               data: {}
 *               statusCode: 200
 *       403:
 *         description: 리뷰 작성일로부터 30일이 지나 삭제할 수 없습니다.
 *         content:
 *           application/json:
 *             example:
 *               error: Forbidden
 *               message: 리뷰 작성일로부터 30일이 지나 삭제할 수 없습니다.
 *               statusCode: 403
 */



router.delete('/:reviewId', authenticateJwt, deleteReview); // 리뷰 삭제
/**
 * @swagger
 * /api/reviews/{reviewId}/edit:
 *   get:
 *     summary: 리뷰 수정 화면 데이터 조회
 *     description: |
 *       ### API 설명
 *       
 *       - 해당 리뷰의 수정 화면에 필요한 정보를 조회하는 API입니다.  
 *       - 프롬프트 정보, 모델 정보, 작성자 정보 및 기존 리뷰 내용을 포함합니다.  
 *       - 로그인한 사용자만 접근할 수 있으며, `Authorization` 헤더가 필요합니다.
 *       
 *       ### Path Variable
 *       | 항목      | 설명             | 예시   | 필수 여부 |
 *       |-----------|------------------|--------|-----------|
 *       | reviewId  | 수정할 리뷰 ID     | `63`   | ✅        |
 *       
 *       ### Header
 *       ```json
 *       {
 *         "Authorization": "Bearer {access_token}"
 *       }
 *       ```
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
 *     responses:
 *       200:
 *         description: 리뷰 수정 화면 데이터를 성공적으로 불러왔습니다.
 *         content:
 *           application/json:
 *             example:
 *               message: 리뷰 수정 화면 데이터를 성공적으로 불러왔습니다.
 *               data:
 *                 prompter_id: 3
 *                 prompter_nickname: 닉네임3
 *                 prompt_id: 5
 *                 prompt_title: 프롬프트 3
 *                 model_id: 3
 *                 model_name: 모델 이름 3
 *                 rating_avg: "4.0"
 *                 content: 너무 유용했어요!
 *               statusCode: 200
 */

router.get('/:reviewId/edit', authenticateJwt, getReviewEditData);
/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   patch:
 *     summary: 특정 리뷰 수정
 *     description: |
 *       ### API 설명
 *       
 *       - 사용자가 본인의 리뷰를 수정할 수 있는 API입니다.  
 *       - 리뷰 내용(`content`)과 평점(`rating`)을 모두 전달해야 합니다.  
 *       - `Authorization` 헤더를 포함한 로그인 사용자만 접근할 수 있습니다.
 *       
 *       ### Path Variable
 *       | 항목      | 설명             | 예시   | 필수 여부 |
 *       |-----------|------------------|--------|-----------|
 *       | reviewId  | 수정할 리뷰 ID     | `59`   | ✅        |
 *       
 *       ### Request Body
 *       | 항목     | 설명       | 예시                 | 필수 여부 |
 *       |----------|------------|----------------------|-----------|
 *       | rating   | 평점 (0~5) | `4.5`                | ✅        |
 *       | content  | 리뷰 내용   | 수정된 전체 내용입니다. | ✅        |
 *       
 *       ### Header
 *       ```json
 *       {
 *         "Authorization": "Bearer {access_token}"
 *       }
 *       ```
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
 *                 format: float
 *                 example: 4.5
 *                 description: 평점 (0.0 ~ 5.0)
 *               content:
 *                 type: string
 *                 example: 수정된 전체 내용입니다.
 *                 description: 리뷰 내용
 *     responses:
 *       200:
 *         description: 리뷰가 성공적으로 수정되었습니다.
 *         content:
 *           application/json:
 *             example:
 *               message: 리뷰가 성공적으로 수정되었습니다.
 *               data:
 *                 review_id: 59
 *                 prompt_id: 10
 *                 writer_name: 남아린
 *                 rating: 4.5
 *                 content: 수정된 전체 내용입니다.
 *                 updated_at: "2025-08-07T09:16:14.838Z"
 *               statusCode: 200
 */

router.patch('/:reviewId', authenticateJwt, editReview);


export default router;
