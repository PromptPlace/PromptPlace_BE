import { Router } from 'express';
import { likePrompt, getLikedPrompts } from '../controllers/prompt.like.controller';

const router = Router();

router.post('/:promptId/likes', likePrompt);
router.get('/likes', getLikedPrompts);

export default router;