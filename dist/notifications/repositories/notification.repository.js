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
exports.findNotificationsByUserId = exports.createNotification = exports.findUsersSubscribedToPrompter = exports.findUserByUserId = exports.deleteSubscription = exports.createSubscription = exports.findSubscription = exports.findFollowing = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// user와 prompter의 팔로우 관계 조회
const findFollowing = (userId, prompterId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.following.findFirst({
        where: {
            following_id: prompterId,
            follower_id: userId
        }
    });
});
exports.findFollowing = findFollowing;
// 특정 프롬프터 알림 설정 여부 조회
const findSubscription = (userId, prompterId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.notificationSubscription.findFirst({
        where: {
            user_id: userId,
            prompter_id: prompterId
        }
    });
});
exports.findSubscription = findSubscription;
// 특정 프롬프터 알림 설정하기
const createSubscription = (userId, prompterId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.notificationSubscription.create({
        data: {
            user_id: userId,
            prompter_id: prompterId
        }
    });
});
exports.createSubscription = createSubscription;
// 특정 프롬프터 알림 설정 취소하기
const deleteSubscription = (userId, prompterId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.notificationSubscription.delete({
        where: {
            user_id_prompter_id: {
                user_id: userId,
                prompter_id: prompterId
            }
        }
    });
});
exports.deleteSubscription = deleteSubscription;
// 사용자 ID로 사용자 정보 조회
const findUserByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
        where: {
            user_id: userId
        }
    });
    return user;
});
exports.findUserByUserId = findUserByUserId;
// 특정 프롬프터를 구독 중인 사용자 목록 조회
const findUsersSubscribedToPrompter = (prompterId) => __awaiter(void 0, void 0, void 0, function* () {
    const subscriptions = yield prisma.notificationSubscription.findMany({
        where: {
            prompter_id: prompterId,
        },
        select: {
            user_id: true, // 알림 받을 사용자 ID만 추출
        },
    });
    return subscriptions.map((sub) => sub.user_id); // user_id로 이루어진 배열로 반환
});
exports.findUsersSubscribedToPrompter = findUsersSubscribedToPrompter;
// 알림 등록 (공통)
const createNotification = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId = null, actorId = null, type, content, linkUrl = null, }) {
    return prisma.notification.create({
        data: {
            user_id: userId,
            actor_id: actorId,
            type,
            content,
            link_url: linkUrl,
        },
    });
});
exports.createNotification = createNotification;
// 알림 목록 조회
const findNotificationsByUserId = (userId, cursor, limit) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.notification.findMany(Object.assign({ where: {
            user_id: userId
        }, orderBy: {
            notification_id: 'desc', // 최신순
        }, take: limit }, (cursor && {
        cursor: {
            notification_id: cursor,
        },
        skip: 1,
    })));
});
exports.findNotificationsByUserId = findNotificationsByUserId;
