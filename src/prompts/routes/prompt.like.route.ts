import { Router } from 'express';
import { authenticateJwt } from '../../config/passport';
import { likePrompt, getLikedPrompts, unlikePrompt } from '../controllers/prompt.like.controller';

const router = Router();

router.post('/:promptId/likes', authenticateJwt, likePrompt);
router.get('/likes', authenticateJwt, getLikedPrompts);
router.delete('/:promptId/likes', authenticateJwt, unlikePrompt);

export default router;