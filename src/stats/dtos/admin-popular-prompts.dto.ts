export interface PopularPromptItem {
  rank: number;
  prompt_id: number;
  title: string;
  views_delta: number;
  downloads_delta: number;
  score: number;
}

export interface PopularPromptsResponse {
  period_days: number;
  snapshot_date: string;
  items: PopularPromptItem[];
}
