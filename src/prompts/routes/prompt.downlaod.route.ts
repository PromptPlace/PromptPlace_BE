import { Router } from 'express';
import { authenticateJwt } from '../../config/passport';
import { PromptDownloadController } from '../controllers/prompt.download.controller';

const router = Router();

router.get('/:promptId/downloads', authenticateJwt, PromptDownloadController.getPromptContent);

export default router;