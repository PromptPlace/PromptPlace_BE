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

// 알림 목록 응답 dto
export interface NotificationListResponse {
  has_more: boolean;
  notifications: {
    notification_id: number;
    content: string;
    created_at: string;
    link_url: string | null;
  }[];
}


// 알림 목록 
export const UserNotificationListDTO = (
  rawNotifications: {
    notification_id: number;
    content: string;
    created_at: Date;
    link_url: string | null;
  }[],
  limit: number
): NotificationListResponse => {
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

// 특정 프롬프터 알림 구독 여부 조회 dto
export const prompterNotificationStatusDto = (
  userId: number,
  prompterId: number,
  existing: boolean
) => {
  return {
    user_id: userId,
    prompter_id: prompterId,
    existing: existing
  }
}
