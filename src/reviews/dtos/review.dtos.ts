import { Review } from '@prisma/client';


export interface ReviewResponse {
  review_id: number;
  writer_id: number;
  prompt_id: number;
  rating: number;
  content: string;
  createdAt: Date;
}

export interface ReviewListResponse {
  has_more: boolean;
  reviews: {
    review_id: number;
    writer_id: number;
    writer_nickname: string;
    rating: number;
    content: string;
    created_at: string;
  }[];
}

// 리뷰 List 반환 DTO
export const mapToReviewListDTO = (
  rawReviews: Review[],
  rawNicknames: { user_id: number; nickname: string }[],
  limit: number
): ReviewListResponse => {
  const userMap = new Map(rawNicknames.map(user => [user.user_id, user.nickname]));

  const reviews = rawReviews.map((review) => ({
    review_id: review.review_id,
    writer_id: review.user_id,
    writer_nickname: userMap.get(review.user_id) || 'Unknown',
    rating: review.rating,
    content: review.content,
    created_at: review.created_at.toISOString()
  }));

  return {
    has_more: rawReviews.length >= limit,
    reviews
  };
};

// 단일 리뷰 정보 반환 DTO
export const mapToReviewResponse = (review: Review): ReviewResponse => ({
  review_id: review.review_id,
  writer_id: review.user_id,
  prompt_id: review.prompt_id,
  rating: review.rating,
  content: review.content,
  createdAt: review.created_at
});
