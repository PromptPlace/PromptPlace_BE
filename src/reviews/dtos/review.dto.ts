
import { Review, Prompt } from '@prisma/client';
import e from 'express';


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
  total_count: number;
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
  limit: number,
  totalCount: number,
  hasMore: boolean
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
    has_more: hasMore,
    total_count: totalCount,
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

// 리뷰 수정 화면 데이터 반환 타입
export interface ReviewEditDataDTO {
  prompter_id: number;
  prompter_nickname: string;
  prompt_id: number;
  prompt_title: string;
  model_id: number;
  model_name: string;
  rating_avg: string;
  content: string;
}

// 리뷰 수정 화면 데이터 반환 dto
export const mapToReviewEditDataDTO = ({
  review,
  prompt,
  modelId,
  modelName,
  prompterId,
  prompterNickname
}: {
  review: Review;
  prompt: Prompt;
  modelId: number;
  modelName: string;
  prompterId: number;
  prompterNickname: string;
}): ReviewEditDataDTO => {
  return {
    prompter_id: prompterId,
    prompter_nickname: prompterNickname,
    prompt_id: prompt.prompt_id,
    prompt_title: prompt.title,
    model_id: modelId,
    model_name: modelName,
    rating_avg: prompt.rating_avg.toFixed(1), // 소수점 첫째 자리까지(string)
    content: review.content,
  };
};


export interface ReviewUpdateResponse {
  review_id: number;
  prompt_id: number;
  writer_name: string;
  rating: number;
  content: string;
  updated_at: string;
}

export const mapToReviewUpdateResponse = (
  review: Review,
  writerName: string
): ReviewUpdateResponse => ({
  review_id: review.review_id,
  prompt_id: review.prompt_id,
  writer_name: writerName,
  rating: review.rating,
  content: review.content,
  updated_at: review.updated_at.toISOString()
});

// 내가 작성한 리뷰 리스트 반환 DTO
export const mapToMyReviewListDTO = (
  rawReviews: (Review & { prompt: { prompt_id: number; title: string } })[],
  limit: number
): {
  reviews: {
    review_id: number;
    prompt_id: number;
    prompt_title: string;
    rating: number;
    content: string;
    created_at: string;
    updated_at: string;
  }[];
  has_more: boolean;
} => {
  const reviews = rawReviews.map(review => ({
    review_id: review.review_id,
    prompt_id: review.prompt.prompt_id,
    prompt_title: review.prompt.title,
    rating: review.rating,
    content: review.content,
    created_at: review.created_at.toISOString(),
    updated_at: review.updated_at.toISOString(),
  }));

  return {
    reviews,
    has_more: rawReviews.length >= limit
  };
};


// 내가 받은 리뷰 리스트 반환 DTO
export interface MyReceivedReviewDTO {
  review_id: number;
  prompt_id: number;
  prompt_title: string;
  writer_id: number;
  writer_nickname: string;
  writer_profile_image_url: string | null;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
}

// 수정된 DTO 반환 타입
export interface MyReceivedReviewDTO {
  review_id: number;
  prompt_id: number;
  prompt_title: string;
  writer_id: number;
  writer_nickname: string;
  writer_profile_image_url: string | null;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export const mapToMyReceivedReviewListDTO = (
  rawReviews: (Review & {
    prompt: { prompt_id: number; title: string };
  })[],
  userProfiles: {
    user_id: number;
    nickname: string;
    profileImage: { url: string } | null;
  }[],
  limit: number
): {
  reviews: MyReceivedReviewDTO[];
  has_more: boolean;
} => {
  const userMap = new Map(
    userProfiles.map(user => [
      user.user_id,
      {
        nickname: user.nickname,
        imageUrl: user.profileImage?.url || null
      }
    ])
  );

  const reviews: MyReceivedReviewDTO[] = rawReviews.map((review) => {
    const writer = userMap.get(review.user_id);

    return {
      review_id: review.review_id,
      prompt_id: review.prompt.prompt_id,
      prompt_title: review.prompt.title,
      writer_id: review.user_id,
      writer_nickname: writer?.nickname || 'Unknown',
      writer_profile_image_url: writer?.imageUrl || null,
      rating: review.rating,
      content: review.content,
      created_at: review.created_at.toISOString(),
      updated_at: review.updated_at.toISOString(),
    };
  });

  return {
    reviews,
    has_more: rawReviews.length >= limit,
  };
};