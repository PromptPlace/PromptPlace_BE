import { Router } from 'express';
import { InquiryController } from '../controllers/inquiry.controller';
import { authenticateJwt } from '../../config/passport';

const router = Router();
const inquiryController = new InquiryController();

router.post(
  '/',
  authenticateJwt,
  inquiryController.createInquiry.bind(inquiryController),
);

export default router; 