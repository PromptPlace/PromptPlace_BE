"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const announcement_controller_1 = require("../controllers/announcement.controller");
const isAdmin_1 = require("../../middlewares/isAdmin");
const passport_1 = require("../../config/passport");
const router = express_1.default.Router({ mergeParams: true });
// 모두 접근 가능
router.get("/", announcement_controller_1.getAnnouncementList);
// 관리자만 접근 가능
router.post("/", passport_1.authenticateJwt, isAdmin_1.isAdmin, announcement_controller_1.createAnnouncement);
router.patch("/:announcementId", passport_1.authenticateJwt, isAdmin_1.isAdmin, announcement_controller_1.patchAnnouncement);
router.patch("/:announcementId/delete", passport_1.authenticateJwt, isAdmin_1.isAdmin, announcement_controller_1.deleteAnnouncement);
exports.default = router;
