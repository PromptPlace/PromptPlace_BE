import { Review } from '@prisma/client';
import {
    findAllByPromptId,
    findNicknameByUserId,
    countReviewsByPromptId
} from '../repositories/review.repository';

import {
    mapToReviewResponseDTO
} from '../dtos/review.dtos';

export const findReviewsByPromptId = async (
    rawPromptId: string,
    rawCursor?: string,
    rawLimit?: string
) => {
    const promptId = parseInt(rawPromptId, 10);
    const cursor = rawCursor ? parseInt(rawCursor, 10) : undefined;
    const limit = rawLimit ? parseInt(rawLimit, 10) : 10;

    if (isNaN(promptId)) throw new Error('promptId값이 적절하지 않습니다');
    if (cursor !== undefined && isNaN(cursor)) throw new Error('cursor값이 적절하지 않습니다');
    if (isNaN(limit)) throw new Error('limit값이 적절하지 않습니다');

    const rawReviews: Review[] = await findAllByPromptId(promptId, cursor, limit);
    const totalCount: number = await countReviewsByPromptId(promptId); // 전체 개수 쿼리

    const userIds = rawReviews.map(review => review.user_id);
    const userNicknames = await findNicknameByUserId(userIds);

    return mapToReviewResponseDTO(rawReviews, userNicknames, totalCount, limit);
};
