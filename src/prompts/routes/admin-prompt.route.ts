import express from 'express';
import { adminDeletePrompt } from '../controllers/prompt.controller';
import { isAdmin } from '../../middlewares/isAdmin';
import { authenticateJwt } from "../../config/passport";

const router = express.Router();

// 관리자 프롬프트 삭제
router.delete(
  '/:promptId',
  authenticateJwt,
  isAdmin,
  adminDeletePrompt
);

export default router;
