export interface UpdatePromptDto {
  title?: string;
  prompt?: string;
  prompt_result?: string;
  model_version?: string;
  has_image?: boolean;
  description?: string;
  usage_guide?: string;
  price?: number;
  is_free?: boolean;
  categories?: string[];
  models?: string[];
} 