export interface PromptDownloadResponseDTO {
  message: string;
  title: string;
  prompt: string;
  is_free: boolean;
  is_paid: boolean;
  statusCode: number;
}

export interface DownloadedPromptResponseDTO {
  message: string;
  prompt_id: number;
  title: string;
  description: string;
  models: string[];
  imageUrls: string[];
  price: number;
  has_review: boolean;
  is_recent_review: boolean;
  userNickname: string;
  userProfileImageUrl: string | null;
  userReview: {
        content: string;
        rating: number;
    } | null;
  statusCode: number;
}