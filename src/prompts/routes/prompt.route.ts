import { Router } from "express";
import * as promptController from "../controllers/prompt.controller";
import { authenticateJwt } from "../../config/passport";

const router = Router();

// 프롬프트 검색 API
router.get("/searches", promptController.searchPrompts);

//프롬프트 상세 조회 API
router.get("/:promptId/details", authenticateJwt, promptController.getPromptDetails);

// S3 presign url 발급 API
router.post("/presign-url", authenticateJwt, promptController.presignUrl);

// 프롬프트 이미지 매핑 API
router.post(
  "/:promptId/images",
  authenticateJwt,
  promptController.createPromptImage
);

// 프롬프트 업로드(작성) API
router.post("/", authenticateJwt, promptController.createPrompt);

// 프롬프트 수정 API
router.patch('/:promptId', authenticateJwt, promptController.updatePrompt);

// 프롬프트 삭제 API
router.delete('/:promptId', authenticateJwt, promptController.deletePrompt);

export default router;
