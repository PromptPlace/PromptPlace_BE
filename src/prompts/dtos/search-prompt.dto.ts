export interface SearchPromptDto {
  model: string;
  tag: string[];
  keyword: string;
  page: number;
  size: number;
  sort: 'recent' | 'popular' | 'download' | 'views' | 'rating_avg' ; // 예시 값들
  is_free: boolean;
}
