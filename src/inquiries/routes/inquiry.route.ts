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

export default router;
