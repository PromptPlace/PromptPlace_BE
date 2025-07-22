export interface PromptDownloadResponseDTO {
  message: string;
  title: string;
  prompt: string;
  is_free: boolean;
  statusCode: number;
}

export interface DownloadedPromptResponseDTO {
  message: string;
  prompt_id: number;
  title: string;
  models: string[];
  has_review: boolean;
  is_recent_review: boolean;
  statusCode: number;
}