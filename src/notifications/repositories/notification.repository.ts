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

