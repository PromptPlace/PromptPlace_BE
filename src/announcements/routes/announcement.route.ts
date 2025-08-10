import express from "express";
import {
  getAnnouncementList,
  getAnnouncement,
  createAnnouncement,
  patchAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcement.controller";
import { isAdmin } from "../../middlewares/isAdmin";
import { authenticateJwt } from "../../config/passport";

const router = express.Router({ mergeParams: true });

// 모두 접근 가능
router.get("/", getAnnouncementList);

// 관리자만 접근 가능
router.get("/:announcementId/details", authenticateJwt, isAdmin, getAnnouncement);
router.post("/", authenticateJwt, isAdmin, createAnnouncement);
router.patch("/:announcementId", authenticateJwt, isAdmin, patchAnnouncement);
router.patch("/:announcementId/delete", authenticateJwt, isAdmin, deleteAnnouncement);

export default router;
