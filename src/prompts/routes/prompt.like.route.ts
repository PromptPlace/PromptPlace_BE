import { Router } from 'express';
import { authenticateJwt } from '../../config/passport';
import { likePrompt, getLikedPrompts } from '../controllers/prompt.like.controller';

const router = Router();

router.post('/:promptId/likes', authenticateJwt, likePrompt);
router.get('/likes', authenticateJwt, getLikedPrompts);

export default router;