import express from "express";
import {
  getTipList,
  createTip,
  patchTip,
  deleteTip,
} from "../controllers/tip.controllers";
import { isAdmin } from "../../middlewares/isAdmin";
import { authenticateJwt } from "../../config/passport";

const router = express.Router({ mergeParams: true });

// 모두 접근 가능
router.get("/", getTipList);

// 관리자만 접근 가능
router.post("/", authenticateJwt, isAdmin, createTip);
router.patch("/:tipId", authenticateJwt, isAdmin, patchTip);
router.patch("/:tipId/delete", authenticateJwt, isAdmin, deleteTip);

export default router;
