import { PrismaClient, NotificationType, User } from '@prisma/client';
const prisma = new PrismaClient();
import { CreateNotificationParams } from '../dtos/notification.dto';

// user와 prompter의 팔로우 관계 조회
export const findFollowing = async (
    userId: number,
    prompterId: number
) => {
    return await prisma.following.findFirst({
        where: {
            following_id: prompterId,
            follower_id: userId
        }
    });
};

// 특정 프롬프터 알림 설정 여부 조회
export const findSubscription = async (
    userId: number,
    prompterId: number
) => {
    return await prisma.notificationSubscription.findFirst({
        where: {
            user_id: userId,
            prompter_id: prompterId
        }
    });
};

// 특정 프롬프터 알림 설정하기
export const createSubscription = async (
    userId: number,
    prompterId: number
) => {
    return await prisma.notificationSubscription.create({
        data: {
            user_id: userId,
            prompter_id: prompterId
        }
    })
}

// 특정 프롬프터 알림 설정 취소하기
export const deleteSubscription = async (
    userId: number,
    prompterId: number
) => {
    return await prisma.notificationSubscription.delete({
        where: {
            user_id_prompter_id: {
                user_id: userId,
                prompter_id: prompterId
            }
        }
    })
}


// 사용자 ID로 사용자 정보 조회
export const findUserByUserId = async (userId: number):Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      user_id: userId
    }
  });
  return user;
};

// 특정 프롬프터를 구독 중인 사용자 목록 조회
export const findUsersSubscribedToPrompter = async (prompterId: number) => {
  const subscriptions = await prisma.notificationSubscription.findMany({
    where: {
      prompter_id: prompterId,
    },
    select: {
      user_id: true, // 알림 받을 사용자 ID만 추출
    },
  });

  return subscriptions.map((sub) => sub.user_id); // user_id로 이루어진 배열로 반환
};

// 알림 등록 (공통)
export const createNotification = async ({
  userId = null,
  actorId = null,
  type,
  content,
  linkUrl = null,
}: CreateNotificationParams) => {
  return prisma.notification.create({
    data: {
      user_id: userId,
      actor_id: actorId,
      type,
      content,
      link_url: linkUrl,
    },
  });
};

// ==========알림 목록 조회==========
export const findNotificationsByUserId = async (
  userId: number,
  cursor?: number,
  limit: number = 10
) => {
  // 1. 기본 알림 + actor 정보 조회 (이미지 제외)
  const notifications = await prisma.notification.findMany({
    where: { user_id: userId },
    select: {
      notification_id: true,
      content: true,
      type: true,
      created_at: true,
      link_url: true,
      actor: {
        select: {
          user_id: true,
          nickname: true,
        },
      },
    },
    orderBy: { notification_id: 'desc' },
    take: limit + 1,
    ...(cursor && {
      cursor: { notification_id: cursor },
      skip: 1,
    }),
  });

  // profileImage 조회
  const actorIdsToFetch = notifications
    .filter(n => (n.type === 'FOLLOW' || n.type === 'NEW_PROMPT' || n.type === 'ADMIN_MESSAGE') && n.actor)
    .map(n => n.actor!.user_id);

  let actorProfilesMap: Record<number, { url: string } | null> = {};

  if (actorIdsToFetch.length > 0) {
    const actorProfiles = await prisma.user.findMany({
      where: { user_id: { in: actorIdsToFetch } },
      select: {
        user_id: true,
        profileImage: { select: { url: true } },
      },
    });

    // 배열 -> 객체로 변환
    actorProfilesMap = Object.fromEntries(
      actorProfiles.map(u => [u.user_id, u.profileImage ?? null])
    );
  }

  // 3. notifications에 profileImage 병합
  const mappedNotifications = notifications.map(n => ({
    ...n,
    actor: n.actor
      ? {
          ...n.actor,
          profileImage:
            n.type === 'FOLLOW' || n.type === 'NEW_PROMPT' || n.type === 'ADMIN_MESSAGE'
              ? actorProfilesMap[n.actor.user_id] ?? null
              : null,
        }
      : null,
  }));

  return mappedNotifications;
};



// 사용자 마지막 알림 확인 시간 조회
export const getLastNotificationCheckTime = async (
  userId: number
) => {
  const user = await prisma.userNotificationSetting.findUnique({
    where: {
      user_id: userId
    }
  });
  return user?.last_notification_check_time || null; 
};


// 최신 알람 시간 조회
export const getLatestNotificationTime = async (
  userId: number
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      user_id: userId
    },
    // 최신순으로 정렬
    orderBy: {
      created_at: 'desc'
    },
    // created_at 필드만 선택
    select: {
      created_at: true
    }
  });

  return notification?.created_at || null;
};

export const getUserNotificationSetting = async (
  userId: number
) => {    
  const setting = await prisma.userNotificationSetting.findUnique({
    where: {
      user_id: userId
    }
  });
  return setting;
};


export const createNotificationCheckTime = async (
  userId: number
) => {  
  await prisma.userNotificationSetting.create({
    data: {
      user_id: userId,
      last_notification_check_time: new Date()
    }
  });
};

export const updateNotificationCheckTime = async (
  userId: number
) => {
  await prisma.userNotificationSetting.update({
    where: {
      user_id: userId
    },
    data: {
      last_notification_check_time: new Date()
    }
  });
};