export interface PurchaseHistoryItemDTO {
  prompt_id: number;
  title: string;
  price: number;
  seller_nickname: string;
  purchased_at: string;
  status: 'Succeed' | 'Refunded';
  refunded_at: string | null;
}

export interface PurchaseHistoryResponseDTO {
  message: string;
  purchases: PurchaseHistoryItemDTO[];
  statusCode: number;
}
