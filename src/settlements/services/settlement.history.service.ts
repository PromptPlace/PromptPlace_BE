import { SettlementHistoryRepository } from '../repositories/settlement.history.repository';
import {
  MonthlySalesResponseDto,
  YearlySettlementResponseDto,
} from '../dtos/settlement.history.dto';

export const SettlementHistoryService = {
  async getMonthlySales(userId: number, year: number, month: number): Promise<MonthlySalesResponseDto> {
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw { status: 400, type: 'ValidationError', message: 'year 값이 올바르지 않습니다.' };
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw { status: 400, type: 'ValidationError', message: 'month 값이 올바르지 않습니다 (1-12).' };
    }

    const rows = await SettlementHistoryRepository.findSalesByMonth(userId, year, month);

    let total_sales = 0;
    let total_settled = 0;
    let total_fee = 0;

    const items = rows.map((r) => {
      const sale_price = r.payment?.purchase?.amount ?? 0;
      total_sales += sale_price;
      total_settled += r.amount;
      total_fee += r.fee;

      return {
        settlement_id: r.settlement_id,
        sold_at: r.created_at.toISOString(),
        prompt_id: r.payment?.purchase?.prompt?.prompt_id ?? 0,
        prompt_title: r.payment?.purchase?.prompt?.title ?? '',
        buyer_id: r.payment?.purchase?.user_id ?? 0,
        buyer_nickname: r.payment?.purchase?.user?.nickname ?? null,
        pay_type: r.payment?.pay_type ?? null,
        card_name: r.payment?.card_name ?? null,
        sale_price,
        settled_amount: r.amount,
        fee: r.fee,
        status: r.status as 'Pending' | 'Succeed' | 'Failed',
      };
    });

    return {
      message: '월별 판매 내역 조회 성공',
      year,
      month,
      summary: { count: items.length, total_sales, total_settled, total_fee },
      items,
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
