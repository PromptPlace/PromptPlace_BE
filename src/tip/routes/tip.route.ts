import express from "express";
import {
  getTipList,
  createTip,
  patchTip,
  deleteTip,
} from "../controllers/tip.controllers";
import { isAdmin } from "../../middlewares/isAdmin";

const router = express.Router({ mergeParams: true });

// 모두 접근 가능
router.get("/", getTipList);

// 관리자만 접근 가능
router.post("/", isAdmin, createTip);
router.patch("/:tipId", isAdmin, patchTip);
router.patch("/:tipId/delete", isAdmin, deleteTip);

export default router;
