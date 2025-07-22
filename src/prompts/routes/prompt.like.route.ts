import { Router } from 'express';
import { likePrompt, getLikedPrompts } from '../controllers/prompt.like.controller';
const router = Router();

router.post('/prompts/:promptId/likes', likePrompt);
router.get('/prompts/likes', getLikedPrompts);

export default router;