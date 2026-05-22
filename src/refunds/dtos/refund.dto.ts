export type RefundIneligibleReason =
  | 'EXPIRED_7DAYS'
  | 'ALREADY_DOWNLOADED'
  | 'ALREADY_REFUNDED'
  | 'NOT_OWNER'
  | 'NOT_PURCHASED'
  | 'PAYMENT_NOT_SUCCEEDED'
  | 'FREE_PURCHASE';

export interface RefundEligibilityResponseDto {
  message: string;
  eligible: boolean;
  reason?: RefundIneligibleReason;
  remaining_seconds?: number;  // 환불 가능한 잔여 시간 (eligible=true일 때만)
  statusCode: number;
}

export interface RefundResultDto {
  message: string;
  refund_id: number;
  refunded_amount: number;
  refunded_at: string;
  statusCode: number;
}
