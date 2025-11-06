export interface LikePromptResponse {
  message: string;
  statusCode: number;
}

export interface LikedPrompt {
  prompt_id: number;
  user_id: number;
  title: string;
  prompt: string;
  prompt_result: string;
  has_image: boolean;
  description: string;
  usage_guide: string;
  price: number;
  is_free: boolean;
  downloads: number;
  views: number;
  likes: number;
  model_version: string;
  created_at: Date;
  updated_at: Date;
  inactive_date: Date | null;
  
  user: UserInfo;
  models: PromptModelInfo[];
  categories: any[];
  images: PromptImageInfo[];
  
  review_count: number; 
  review_rating_avg: number;
}

export interface GetLikedPromptsResponse {
  message: string;
  statusCode: number;
  data: LikedPrompt[];
}

interface UserInfo {
  user_id: number;
  nickname: string;
  profileImage: { 
    id: number;
    url: string;
    userId: number;
    created_at: Date;
    updated_at: Date;
  } | null;
}

interface PromptModelInfo {
  promptmodel_id: number;
  prompt_id: number;
  model_id: number;
  model: {
    name: string;
  };
}

interface PromptImageInfo {
  image_url: string;
  image_id: number;
  order_index: number;
}