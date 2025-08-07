"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventBus_1 = __importDefault(require("../../config/eventBus"));
const notification_service_1 = require("../services/notification.service");
// 신고 알림 리스너
eventBus_1.default.on('report.created', (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, notification_service_1.createReportNotification)(userId); // 나에게 알림 생성
    }
    catch (err) {
        console.error('[알림 리스너 오류]: 신고 알림 생성 실패', err);
    }
}));
// 공지 알림 리스너
eventBus_1.default.on('announcement.created', (announcementId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, notification_service_1.createAnnouncementNotification)(announcementId);
    }
    catch (err) {
        console.error("[알림 리스너 오류]: 공지사항 알림 생성 실패", err);
    }
}));
// 새로운 팔로워 알림 리스너
eventBus_1.default.on('follow.created', (followerId, followingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, notification_service_1.createFollowNotification)(followerId, followingId);
    }
    catch (err) {
        console.error("[알림 리스너 오류]: 새로운 팔로워 알림 생성 실패", err);
    }
}));
// 새로운 문의 등록 알림 리스너
eventBus_1.default.on('inquiry.created', (receiverId, senderId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, notification_service_1.createInquiryNotification)(receiverId, senderId);
    }
    catch (err) {
        console.error("[알림 리스너 오류]: 새로운 문의 알림 생성 실패", err);
    }
}));
// 새로운 프롬프트 업로드 알림 리스너
eventBus_1.default.on('prompt.created', (prompterId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, notification_service_1.createPromptNotification)(prompterId);
    }
    catch (err) {
        console.error("[알림 리스너 오류]: 새로운 프롬프트 업로드 알림 생성 실패", err);
    }
}));
