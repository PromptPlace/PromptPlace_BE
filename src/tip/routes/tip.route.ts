import express from "express";
import {
  getTipList,
  createTip,
  patchTip,
  deleteTip,
} from "../controllers/tip.controllers";

const router = express.Router({ mergeParams: true });
router.get("/", getTipList);
router.post("/", createTip);
router.patch("/:tipId", patchTip);
router.patch("/delete/:tipId", deleteTip);
export default router;
