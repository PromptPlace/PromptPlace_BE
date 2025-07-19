import { Router } from 'express';
import * as promptController from './prompt.controller';

const router = Router();

// 프롬프트 검색 API
router.get('/searches', promptController.searchPrompts);


export default router;