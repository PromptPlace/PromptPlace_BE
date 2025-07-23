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
  rawProfiles: { user_id: number; nickname: string; profileImage: { url: string } | null }[],
  limit: number
): ReviewListResponse => {
  const userMap = new Map(
    rawProfiles.map(user => [
      user.user_id,
      {
        nickname: user.nickname,
        imageUrl: user.profileImage?.url || null
      }
    ])
  );

  const reviews = rawReviews.map((review) => {
    const userInfo = userMap.get(review.user_id);
    
    return {
      review_id: review.review_id,
      writer_id: review.user_id,
      writer_nickname: userInfo?.nickname || 'Unknown',
      writer_image_url: userInfo?.imageUrl || null,
      rating: review.rating,
      content: review.content,
      created_at: review.created_at.toISOString()
    };
  });

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
