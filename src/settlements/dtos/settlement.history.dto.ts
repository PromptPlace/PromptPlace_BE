export interface MonthlySalesItemDto {
  settlement_id: number;
  sold_at: string;
  prompt_id: number;
  prompt_title: string;
  buyer_id: number;
  buyer_nickname: string | null;
  pay_type: string | null;
  card_name: string | null;
  sale_price: number;
  settled_amount: number;
  fee: number;
  status: 'Pending' | 'Succeed' | 'Failed' | 'Refunded';
}

// 월 전체 합계 (페이지 무관 — #497 페이지네이션 도입과 함께 의미 정합화)
export interface MonthlySalesSummaryDto {
  count: number;                  // 월 전체 거래 건수
  total_sales: number;
  total_settled: number;          // net — 환불 제외
  total_fee: number;
  refunded_count: number;
  refunded_amount: number;
}

export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
}

export interface MonthlySalesResponseDto {
  message: string;
  year: number;
  month: number;
  summary: MonthlySalesSummaryDto;
  pagination: PaginationDto;
  items: MonthlySalesItemDto[];
  statusCode: number;
}

export interface YearlySettlementItemDto {
  year: number;
  count: number;
  total_sales: number;       // gross
  total_settled: number;     // net — 환불 제외, Succeed 합계
  total_fee: number;
  succeeded_amount: number;
  pending_amount: number;
  refunded_amount: number;
  refunded_count: number;
}

export interface YearlySettlementResponseDto {
  message: string;
  items: YearlySettlementItemDto[];
  statusCode: number;
}

export interface PendingAmountResponseDto {
  message: string;
  pending_amount: number;
  pending_count: number;
  statusCode: number;
}
