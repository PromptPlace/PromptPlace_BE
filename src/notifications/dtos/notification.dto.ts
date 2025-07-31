import { NotificationType } from '@prisma/client';

// 신고 등록 응답 인터페이스
export interface CreateSubscriptionResponse {
    subscribed: boolean;
    user_id: number;
    prompter_id: number;
}

// 프롬프터 알림 설정 응답 DTO
export const mapToSubscribeResponse = (
    user_id: number,
    prompter_id: number,
    subscribed: boolean
): CreateSubscriptionResponse => {
    return {
        subscribed,
        user_id,
        prompter_id,
    };
};

// 알림 등록 입력값(공통)
export interface CreateNotificationParams {
  userId?: number | null;
  actorId?: number | null;
  type: NotificationType;
  content: string;
  linkUrl?: string | null;
}
