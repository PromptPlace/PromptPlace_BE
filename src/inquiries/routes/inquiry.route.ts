import { Router } from "express";
import { InquiryController } from "../controllers/inquiry.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();
const inquiryController = new InquiryController();

router.post(
  "/",
  authenticateJwt,
  inquiryController.createInquiry.bind(inquiryController)
);

router.get(
  "/received",
  authenticateJwt,
  inquiryController.getReceivedInquiries.bind(inquiryController)
);

router.get(
  "/:inquiryId",
  authenticateJwt,
  inquiryController.getInquiryById.bind(inquiryController)
);

// 문의 답변 등록 API
router.post(
  "/:inquiryId/replies",
  authenticateJwt,
  inquiryController.createInquiryReply.bind(inquiryController)
);

// 문의 읽음 처리 API
router.patch(
  "/:inquiryId/read",
  authenticateJwt,
  inquiryController.markInquiryAsRead.bind(inquiryController)
);

export default router;
