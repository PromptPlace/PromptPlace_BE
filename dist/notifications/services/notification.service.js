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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFollowNotification = exports.createAnnouncementNotification = exports.createReportNotification = exports.createNotificationService = exports.createSubscriptionService = void 0;
const notification_dto_1 = require("../dtos/notification.dto");
const notification_repository_1 = require("../repositories/notification.repository");
const client_1 = require("@prisma/client");
const createSubscriptionService = (rawPrompterId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!rawPrompterId || isNaN(Number(rawPrompterId))) {
        throw new Error('유효하지 않은 prompterId입니다.');
    }
    const prompterId = Number(rawPrompterId);
    // 자기 자신 알림 설정 방지
    if (userId === prompterId) {
        throw new Error('자기 자신은 알림을 받을 수 없습니다.');
    }
    // 기존 알림 설정 확인
    const existingSubscription = yield (0, notification_repository_1.findSubscription)(userId, prompterId);
    let subscribed;
    // 이미 알림 설정 -> 알림 설정 취소
    if (existingSubscription) {
        yield (0, notification_repository_1.deleteSubscription)(userId, prompterId);
        subscribed = false;
    }
    // 알림 설정 하지 않은 경우
    else {
        // 팔로우 여부 확인
        const isFollowing = yield (0, notification_repository_1.findFollowing)(userId, prompterId);
        if (!isFollowing) { // 팔로우하지 않은 경우 
            throw new Error('프롬프터를 팔로우한 사용자만 알림 등록이 가능합니다.');
        }
        // 알림 등록
        yield (0, notification_repository_1.createSubscription)(userId, prompterId);
        subscribed = true;
    }
    return (0, notification_dto_1.mapToSubscribeResponse)(userId, prompterId, subscribed); // 객체로 반환
});
exports.createSubscriptionService = createSubscriptionService;
// 알림 접수(공통)
const createNotificationService = (params) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, notification_repository_1.createNotification)(params);
});
exports.createNotificationService = createNotificationService;
// 신고 접수 알림 
const createReportNotification = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.createNotificationService)({
        userId,
        type: client_1.NotificationType.REPORT,
        content: '신고가 접수되었습니다.',
        linkUrl: null,
        actorId: null,
    });
});
exports.createReportNotification = createReportNotification;
// 공지사항 등록 알림
const createAnnouncementNotification = (announcementId) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.createNotificationService)({
        userId: null, // 모든 사용자 대상이므로 null
        type: client_1.NotificationType.ANNOUNCEMENT,
        content: '새로운 공지사항이 등록되었습니다.',
        linkUrl: `/announcements/${announcementId}`,
        actorId: null,
    });
});
exports.createAnnouncementNotification = createAnnouncementNotification;
// 새로운 팔로워 알림
const createFollowNotification = (followerId, followingId) => __awaiter(void 0, void 0, void 0, function* () {
    // 팔로워 Id로 팔로워 닉네임 조회
    const user = yield (0, notification_repository_1.findUserByUserId)(followerId);
    if (!user) {
        throw new Error('팔로워 정보를 찾을 수 없습니다.');
    }
    const followerNickname = user.nickname;
    yield (0, exports.createNotificationService)({
        userId: followingId,
        type: client_1.NotificationType.FOLLOW,
        content: `'${followerNickname}'님이 회원님을 팔로우합니다.`,
        linkUrl: `/profile/${followerId}`,
        actorId: followerId,
    });
});
exports.createFollowNotification = createFollowNotification;
