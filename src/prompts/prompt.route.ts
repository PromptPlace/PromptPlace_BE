import { Router } from "express";
import * as promptController from "./prompt.controller";
import { authenticateJwt } from "../config/passport";

const router = Router();

// 프롬프트 검색 API
router.get("/searches", promptController.searchPrompts);

// S3 presign url 발급 API
router.post("/presign-url", authenticateJwt, promptController.presignUrl);

// 프롬프트 이미지 매핑 API
router.post(
  "/:promptId/images",
  authenticateJwt,
  promptController.createPromptImage
);

export default router;
