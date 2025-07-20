// review.router.ts 또는 promptReviewRouter.ts
import express from 'express';
import { 
    getReviewsByPromptId,
    postReview,
} from '../controllers/review.controller';

const router = express.Router({ mergeParams: true }); 
router.get('/', getReviewsByPromptId);
router.post('/', postReview);
export default router;
