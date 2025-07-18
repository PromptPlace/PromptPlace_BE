export interface LikePromptResponse {
  message: string;
  statusCode: number;
}

export interface LikedPrompt {
  prompt_id: number;
  title: string;
  description: string;
  is_free: boolean;
  download_url: string | null;
  liked_at: string;
}

export interface GetLikedPromptsResponse {
  message: string;
  statusCode: number;
  data: LikedPrompt[];
}