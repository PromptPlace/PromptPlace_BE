import express from 'express';
import { authenticateJwt } from '../../config/passport';
import { 
    getReviewsByPromptId,
    postReview,
    deleteReview,
    getReviewEditData,
    editReview,
    getReviewsWrittenByMe,
} from '../controllers/review.controller';

const router = express.Router();

router.get('/me', authenticateJwt, getReviewsWrittenByMe); // 내가 작성한 리뷰 목록 조회

router.get('/:promptId', authenticateJwt, getReviewsByPromptId);
router.post('/:promptId', authenticateJwt, postReview);
router.delete('/:reviewId', authenticateJwt, deleteReview);
router.get('/:reviewId/edit', authenticateJwt, getReviewEditData);
router.patch('/:reviewId', authenticateJwt, editReview);


export default router;
