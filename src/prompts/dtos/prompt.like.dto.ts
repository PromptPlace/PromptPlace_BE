export interface LikePromptResponse {
  message: string;
  statusCode: number;
}

export interface LikedPrompt {
  prompt_id: number;
  title: string;
  models: string[];
  tags: string[];
}

export interface GetLikedPromptsResponse {
  message: string;
  statusCode: number;
  data: LikedPrompt[];
}