export type PurchaseResultStatus = 'Pending' | 'Succeed' | 'Failed' | 'Refunded';

export interface PurchaseResultResponseDTO {
  message: string;
  statusCode: 200;
  order_id: string;
  status: PurchaseResultStatus;
  purchase_id: number;
  prompt_id: number;
  amount: number;
  created_at: string;
}
