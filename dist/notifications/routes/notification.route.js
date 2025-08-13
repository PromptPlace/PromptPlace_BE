"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = require("../../config/passport");
const notification_controller_1 = require("../controllers/notification.controller");
const router = express_1.default.Router();
router.get('/me', passport_1.authenticateJwt, notification_controller_1.getNotificationList); // 알림 목록 조회
router.post('/:prompterId', passport_1.authenticateJwt, notification_controller_1.toggleNotificationSubscription); // 프롬프터 알림 설정, 취소
exports.default = router;
