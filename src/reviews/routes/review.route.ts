import express from 'express';
import { authenticateJwt } from '../../config/passport';
import { 
    getReviewsByPromptId,
    postReview,
} from '../controllers/review.controller';

const router = express.Router();

router.get('/:promptId', authenticateJwt, getReviewsByPromptId);

router.post('/:promptId', authenticateJwt, postReview);
export default router;
