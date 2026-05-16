export interface DailyUploadBucket {
  date: string;
  count: number;
}

export interface NewPromptStatsResponse {
  daily_count: number;
  weekly_count: number;
  daily_uploads: DailyUploadBucket[];
}

export interface TopSalesPromptItem {
  rank: number;
  prompt_id: number;
  title: string | null;
  total_sales: number;
}

export interface TopSalesPromptsResponse {
  period_days: number;
  items: TopSalesPromptItem[];
}
