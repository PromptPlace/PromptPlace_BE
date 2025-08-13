"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotificationListDTO = exports.mapToSubscribeResponse = void 0;
// 프롬프터 알림 설정 응답 DTO
const mapToSubscribeResponse = (user_id, prompter_id, subscribed) => {
    return {
        subscribed,
        user_id,
        prompter_id,
    };
};
exports.mapToSubscribeResponse = mapToSubscribeResponse;
// 알림 목록 
const UserNotificationListDTO = (rawNotifications, limit) => {
    const has_more = rawNotifications.length === limit;
    const notifications = rawNotifications.map((n) => ({
        notification_id: n.notification_id,
        content: n.content,
        created_at: n.created_at.toISOString(),
        link_url: n.link_url, // null 가능
    }));
    return {
        has_more,
        notifications,
    };
};
exports.UserNotificationListDTO = UserNotificationListDTO;
