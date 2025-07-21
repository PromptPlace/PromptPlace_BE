import { Router } from 'express';
import { PromptDownloadController } from '../controllers/prompt.download.controller';

const router = Router();

router.get('/:promptId/downloads', PromptDownloadController.getPromptContent);

export default router;