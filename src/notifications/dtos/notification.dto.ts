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

// 알림 목록 응답 DTO 타입
export interface NotificationListResponse {
  has_more: boolean;
  notifications: {
    notification_id: number;
    content: string;
    type: string;
    created_at: string;
    link_url: string | null;
    actor: {
      user_id: number;
      nickname: string;
      profile_image: string | null;
    } | null;
  }[];
}

// 알림 목록 반환
export const UserNotificationListDTO = (
  rawNotifications: {
    notification_id: number;
    content: string;
    type: string;
    created_at: Date;
    link_url: string | null;
    actor: {
      user_id: number;
      nickname: string;
      profileImage: { url: string } | null;
    } | null;
  }[],
  hasMore: boolean
): NotificationListResponse => {
  const notifications = rawNotifications.map((n) => ({
    notification_id: n.notification_id,
    content: n.content,
    type: n.type,
    created_at: n.created_at.toISOString(),
    link_url: n.link_url,
    actor: n.actor
      ? {
          user_id: n.actor.user_id,
          nickname: n.actor.nickname,
          profile_image: n.actor.profileImage?.url ?? null,
        }
      : null,
  }));

  return {
    has_more: hasMore,
    notifications,
  };
};

// 특정 프롬프터 알림 구독 여부 조회 dto
export const prompterNotificationStatusDto = (
  userId: number,
  prompterId: number,
  subscribed: boolean
) => {
  return {
    user_id: userId,
    prompter_id: prompterId,
    subscribed: subscribed
  }
}
