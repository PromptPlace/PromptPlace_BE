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
  status: 'Pending' | 'Succeed' | 'Failed';
}

export interface MonthlySalesSummaryDto {
  count: number;
  total_sales: number;
  total_settled: number;
  total_fee: number;
}

export interface MonthlySalesResponseDto {
  message: string;
  year: number;
  month: number;
  summary: MonthlySalesSummaryDto;
  items: MonthlySalesItemDto[];
  statusCode: number;
}

export interface YearlySettlementItemDto {
  year: number;
  count: number;
  total_sales: number;
  total_settled: number;
  total_fee: number;
  succeeded_amount: number;
  pending_amount: number;
}

export interface YearlySettlementResponseDto {
  message: string;
  items: YearlySettlementItemDto[];
  statusCode: number;
}
