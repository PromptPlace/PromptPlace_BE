import prisma from '../../config/prisma';
import { Status } from '@prisma/client';

export const SettlementHistoryRepository = {
  // 정산 예정 금액 — Settlement.status='Pending' 인 행의 amount 합계.
  // 정산 완료 처리 (Pending → Succeed) 흐름이 별도 이슈에서 구현되기 전까지는
  // 이 값이 모든 미정산 거래의 누계가 됨.
  async sumPendingAmount(userId: number): Promise<{ pending_amount: number; pending_count: number }> {
    const result = await prisma.settlement.aggregate({
      where: { user_id: userId, status: Status.Pending },
      _sum: { amount: true },
      _count: { _all: true },
    });
    return {
      pending_amount: result._sum.amount ?? 0,
      pending_count: result._count._all ?? 0,
    };
  },

  // 월별 판매 내역 (페이지네이션 적용).
  // 페이지 데이터만 반환. 합계/카운트는 aggregateSalesByMonth/countSalesByMonth로 별도 조회.
  async findSalesByMonth(
    userId: number,
    year: number,
    month: number,
    skip: number,
    take: number,
  ) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    return prisma.settlement.findMany({
      where: {
        user_id: userId,
        created_at: { gte: start, lt: end },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take,
      select: {
        settlement_id: true,
        amount: true,
        fee: true,
        status: true,
        created_at: true,
        payment: {
          select: {
            pay_type: true,
            card_name: true,
            purchase: {
              select: {
                amount: true,
                user_id: true,
                user: { select: { nickname: true } },
                prompt: { select: { prompt_id: true, title: true } },
              },
            },
          },
        },
      },
    });
  },

  // 월별 판매 전체 건수 (페이지네이션 메타).
  async countSalesByMonth(userId: number, year: number, month: number): Promise<number> {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    return prisma.settlement.count({
      where: { user_id: userId, created_at: { gte: start, lt: end } },
    });
  },

  // 월 전체 합계 (페이지 무관).
  // summary 의미를 "현재 페이지 합계"가 아닌 "월 전체 합계"로 정합화 (#497).
  async aggregateSalesByMonth(
    userId: number,
    year: number,
    month: number,
  ): Promise<{
    total_sales: number;
    total_settled: number;
    total_fee: number;
    refunded_amount: number;
    refunded_count: number;
  }> {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const rows = await prisma.$queryRaw<
      Array<{
        total_sales: bigint | null;
        total_settled: bigint | null;
        total_fee: bigint | null;
        refunded_amount: bigint | null;
        refunded_count: bigint | null;
      }>
    >`
      SELECT
        SUM(p.amount) AS total_sales,
        SUM(CASE WHEN s.status = ${Status.Refunded} THEN 0 ELSE s.amount END) AS total_settled,
        SUM(s.fee) AS total_fee,
        SUM(CASE WHEN s.status = ${Status.Refunded} THEN s.amount ELSE 0 END) AS refunded_amount,
        SUM(CASE WHEN s.status = ${Status.Refunded} THEN 1 ELSE 0 END) AS refunded_count
      FROM Settlement s
      JOIN Payment pm ON pm.payment_id = s.payment_id
      JOIN Purchase p ON p.purchase_id = pm.purchase_id
      WHERE s.user_id = ${userId}
        AND s.created_at >= ${start}
        AND s.created_at < ${end}
    `;
    const r = rows[0] ?? {};
    return {
      total_sales: Number(r.total_sales ?? 0),
      total_settled: Number(r.total_settled ?? 0),
      total_fee: Number(r.total_fee ?? 0),
      refunded_amount: Number(r.refunded_amount ?? 0),
      refunded_count: Number(r.refunded_count ?? 0),
    };
  },

  async aggregateYearlyTotals(userId: number): Promise<
    Array<{
      year: number;
      count: number;
      total_sales: number;          // gross — 환불 포함 (비교용)
      total_settled: number;        // net — Succeed 합계 (환불 제외)
      total_fee: number;            // gross fee (환불 포함)
      succeeded_amount: number;     // Succeed만
      pending_amount: number;       // Pending만
      refunded_amount: number;      // Refunded만
      refunded_count: number;
    }>
  > {
    const rows = await prisma.$queryRaw<
      Array<{
        year: number;
        count: bigint;
        total_fee: bigint | null;
        succeeded_amount: bigint | null;
        pending_amount: bigint | null;
        refunded_amount: bigint | null;
        refunded_count: bigint;
        total_sales: bigint | null;
      }>
    >`
      SELECT
        YEAR(s.created_at) AS year,
        COUNT(*) AS count,
        SUM(s.fee) AS total_fee,
        SUM(CASE WHEN s.status = ${Status.Succeed} THEN s.amount ELSE 0 END) AS succeeded_amount,
        SUM(CASE WHEN s.status = ${Status.Pending} THEN s.amount ELSE 0 END) AS pending_amount,
        SUM(CASE WHEN s.status = ${Status.Refunded} THEN s.amount ELSE 0 END) AS refunded_amount,
        SUM(CASE WHEN s.status = ${Status.Refunded} THEN 1 ELSE 0 END) AS refunded_count,
        SUM(p.amount) AS total_sales
      FROM Settlement s
      JOIN Payment pm ON pm.payment_id = s.payment_id
      JOIN Purchase p ON p.purchase_id = pm.purchase_id
      WHERE s.user_id = ${userId}
      GROUP BY YEAR(s.created_at)
      ORDER BY year DESC
    `;

    return rows.map((r) => {
      const succeeded = Number(r.succeeded_amount ?? 0);
      return {
        year: Number(r.year),
        count: Number(r.count),
        total_sales: Number(r.total_sales ?? 0),
        total_settled: succeeded,                       // net: 환불 제외, 정산 완료만
        total_fee: Number(r.total_fee ?? 0),
        succeeded_amount: succeeded,
        pending_amount: Number(r.pending_amount ?? 0),
        refunded_amount: Number(r.refunded_amount ?? 0),
        refunded_count: Number(r.refunded_count ?? 0),
      };
    });
  },
};
