import { SettlementHistoryRepository } from '../repositories/settlement.history.repository';
import {
  MonthlySalesResponseDto,
  YearlySettlementResponseDto,
  PendingAmountResponseDto,
} from '../dtos/settlement.history.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const sanitizePagination = (page?: number, limit?: number): { page: number; limit: number } => {
  const safePage = Number.isInteger(page) && (page as number) > 0 ? (page as number) : DEFAULT_PAGE;
  const safeLimit =
    Number.isInteger(limit) && (limit as number) > 0
      ? Math.min(limit as number, MAX_LIMIT)
      : DEFAULT_LIMIT;
  return { page: safePage, limit: safeLimit };
};

export const SettlementHistoryService = {
  async getMonthlySales(
    userId: number,
    year: number,
    month: number,
    pageParam?: number,
    limitParam?: number,
  ): Promise<MonthlySalesResponseDto> {
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw { status: 400, type: 'ValidationError', message: 'year 값이 올바르지 않습니다.' };
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw { status: 400, type: 'ValidationError', message: 'month 값이 올바르지 않습니다 (1-12).' };
    }

    const { page, limit } = sanitizePagination(pageParam, limitParam);
    const skip = (page - 1) * limit;

    const [rows, total, totals] = await Promise.all([
      SettlementHistoryRepository.findSalesByMonth(userId, year, month, skip, limit),
      SettlementHistoryRepository.countSalesByMonth(userId, year, month),
      SettlementHistoryRepository.aggregateSalesByMonth(userId, year, month),
    ]);

    const items = rows.map((r) => ({
      settlement_id: r.settlement_id,
      sold_at: r.created_at.toISOString(),
      prompt_id: r.payment?.purchase?.prompt?.prompt_id ?? 0,
      prompt_title: r.payment?.purchase?.prompt?.title ?? '',
      buyer_id: r.payment?.purchase?.user_id ?? 0,
      buyer_nickname: r.payment?.purchase?.user?.nickname ?? null,
      pay_type: r.payment?.pay_type ?? null,
      card_name: r.payment?.card_name ?? null,
      sale_price: r.payment?.purchase?.amount ?? 0,
      settled_amount: r.amount,
      fee: r.fee,
      status: r.status as 'Pending' | 'Succeed' | 'Failed' | 'Refunded',
    }));

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      message: '월별 판매 내역 조회 성공',
      year,
      month,
      summary: {
        count: total,
        total_sales: totals.total_sales,
        total_settled: totals.total_settled,
        total_fee: totals.total_fee,
        refunded_count: totals.refunded_count,
        refunded_amount: totals.refunded_amount,
      },
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
      },
      items,
      statusCode: 200,
    };
  },

  async getPendingAmount(userId: number): Promise<PendingAmountResponseDto> {
    const { pending_amount, pending_count } = await SettlementHistoryRepository.sumPendingAmount(userId);
    return {
      message: '정산 예정 금액 조회 성공',
      pending_amount,
      pending_count,
      statusCode: 200,
    };
  },

  async getYearlySettlements(userId: number): Promise<YearlySettlementResponseDto> {
    const items = await SettlementHistoryRepository.aggregateYearlyTotals(userId);
    return {
      message: '연도별 누적 정산 내역 조회 성공',
      items,
      statusCode: 200,
    };
  },
};
