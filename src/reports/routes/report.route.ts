import express from 'express';
import { authenticateJwt } from '../../config/passport';
import {    
    postReport,
} from '../controllers/report.controller';

const router = express.Router();

router.post('/', authenticateJwt, postReport); // 특정 프롬프트에 대한 신고 등록

export default router;
