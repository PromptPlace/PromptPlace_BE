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

router.get('/me', authenticateJwt, getReviewsWrittenByMe); // 내가 작성한 리뷰 목록 조회
router.get('/received-reviews/me', authenticateJwt, getMyReceivedReviews); // 내가 받은 리뷰 목록 조회
router.get('/:promptId', authenticateJwt, getReviewsByPromptId); // 특정 프롬프트 리뷰 목록 조회
router.post('/:promptId', authenticateJwt, postReview); // 특정 프롬프트에 대한 리뷰 작성
router.delete('/:reviewId', authenticateJwt, deleteReview);
router.get('/:reviewId/edit', authenticateJwt, getReviewEditData);
router.patch('/:reviewId', authenticateJwt, editReview);


export default router;
