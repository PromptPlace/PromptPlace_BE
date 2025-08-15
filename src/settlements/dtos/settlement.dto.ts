export interface SaleHistoryItemDto {
  prompt_id: number;
  title: string;
  price: number;
  sold_at: string;
  buyer_nickname: string;
}

export interface SaleHistoryResponseDto {
  message: string;
  sales: SaleHistoryItemDto[];
  statusCode: number;
}