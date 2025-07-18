import { Review } from '@prisma/client';

export interface ReviewResponseDTO {
    review_id: number;
    writer_id: number;
    writer_nickname: string;
    rating: number;
    content: string;
    created_at: string;
}

export interface ReviewListResponse {
    count: number;
    has_more: boolean;
    reviews: ReviewResponseDTO[];
}

export const mapToReviewResponseDTO = (
    rawReviews: Review[],
    rawNicknames: { user_id: number; nickname: string }[],
    totalCount: number,
    limit: number
): ReviewListResponse => {
    const userMap = new Map(rawNicknames.map(user => [user.user_id, user.nickname]));

    const reviews: ReviewResponseDTO[] = rawReviews.map((review) => ({
        review_id: review.review_id,
        writer_id: review.user_id,
        writer_nickname: userMap.get(review.user_id) || "Unknown",
        rating: review.rating,
        content: review.content,
        created_at: review.created_at.toISOString(),
    }));

    return {
        count: totalCount,
        has_more: rawReviews.length >= limit,
        reviews,
    };
};
