export interface PromptDownloadResponseDTO {
  message: string;
  title: string;
  prompt: string;
  is_free: boolean;
  is_paid: boolean;
  statusCode: number;
}