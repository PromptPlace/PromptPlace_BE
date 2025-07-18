import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const findAllByPromptId = async (
    promptId: number,
    cursor?: number,
    limit?: number
) => {
    return await prisma.review.findMany({
        where: {
            prompt_id: promptId,
            ...(cursor && { review_id: { lt: cursor } })
        },
        orderBy: {
            review_id: 'desc'
        },
        take: limit
    });
};

export const findNicknameByUserId = async (userIds: number[]) => {
    return await prisma.user.findMany({
        where: {
            user_id: { in: userIds }
        },
        select: {
            user_id: true,
            nickname: true
        }
    });
};

export const countReviewsByPromptId = async (promptId: number) => {
    return await prisma.review.count({
        where: {
            prompt_id: promptId
        }
    });
};
