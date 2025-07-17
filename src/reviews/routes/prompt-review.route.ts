// review.router.ts 또는 promptReviewRouter.ts
import express from 'express';
import { getReviewsByPromptId } from '../controllers/review.controller';

const router = express.Router({ mergeParams: true }); 
router.get('/', getReviewsByPromptId);

export default router;
