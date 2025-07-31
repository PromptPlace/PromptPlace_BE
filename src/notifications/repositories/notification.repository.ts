import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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