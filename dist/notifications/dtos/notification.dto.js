"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToSubscribeResponse = void 0;
// 프롬프터 알림 설정 응답 DTO
const mapToSubscribeResponse = (user_id, prompter_id, subscribed) => {
    return {
        subscribed,
        user_id,
        prompter_id,
    };
};
exports.mapToSubscribeResponse = mapToSubscribeResponse;
