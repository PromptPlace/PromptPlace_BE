import express from 'express';
import { authenticateJwt } from '../../config/passport';
import { 
    getReviewsByPromptId,
    postReview,
    deleteReview,
    getReviewEditData
} from '../controllers/review.controller';

const router = express.Router();

router.get('/:promptId', authenticateJwt, getReviewsByPromptId);
router.post('/:promptId', authenticateJwt, postReview);
router.delete('/:reviewId', authenticateJwt, deleteReview);
router.get('/:reviewId/edit', authenticateJwt, getReviewEditData);
export default router;
