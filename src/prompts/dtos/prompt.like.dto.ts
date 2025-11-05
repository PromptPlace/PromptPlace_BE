export interface LikePromptResponse {
  message: string;
  statusCode: number;
}

export interface LikedPrompt {
  prompt_id: number;
  title: string;
  nickname: string;
  models: string[];
  price: number;
  promptContent: string;
  imageUrls: string[];
  views: number;
  downloads: number;
  created_at: Date;
}

export interface GetLikedPromptsResponse {
  message: string;
  statusCode: number;
  data: LikedPrompt[];
}