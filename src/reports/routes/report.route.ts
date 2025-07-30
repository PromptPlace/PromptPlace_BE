import express from 'express';
import { authenticateJwt } from '../../config/passport';
import {    
    postReport,
    getReportedPrompts,
} from '../controllers/report.controller';
import { get } from 'http';

const router = express.Router();

router.post('/', authenticateJwt, postReport); // 특정 프롬프트에 대한 신고 등록
router.get('/', authenticateJwt, getReportedPrompts); // 신고 당한 프롬프트 목록 조회(관리자용)
export default router;
