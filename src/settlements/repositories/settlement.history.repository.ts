import prisma from '../../config/prisma';
import { Status } from '@prisma/client';

export const SettlementHistoryRepository = {
  async findSalesByMonth(userId: number, year: number, month: number) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    return prisma.settlement.findMany({
      where: {
        user_id: userId,
        created_at: { gte: start, lt: end },
      },
      orderBy: { created_at: 'desc' },
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

  async aggregateYearlyTotals(userId: number): Promise<
    Array<{
      year: number;
      count: number;
      total_sales: number;
      total_settled: number;
      total_fee: number;
      succeeded_amount: number;
      pending_amount: number;
    }>
  > {
    const rows = await prisma.$queryRaw<
      Array<{
        year: number;
        count: bigint;
        total_settled: bigint | null;
        total_fee: bigint | null;
        succeeded_amount: bigint | null;
        pending_amount: bigint | null;
        total_sales: bigint | null;
      }>
    >`
      SELECT
        YEAR(s.created_at) AS year,
        COUNT(*) AS count,
        SUM(s.amount) AS total_settled,
        SUM(s.fee) AS total_fee,
        SUM(CASE WHEN s.status = ${Status.Succeed} THEN s.amount ELSE 0 END) AS succeeded_amount,
        SUM(CASE WHEN s.status = ${Status.Pending} THEN s.amount ELSE 0 END) AS pending_amount,
        SUM(p.amount) AS total_sales
      FROM Settlement s
      JOIN Payment pm ON pm.payment_id = s.payment_id
      JOIN Purchase p ON p.purchase_id = pm.purchase_id
      WHERE s.user_id = ${userId}
      GROUP BY YEAR(s.created_at)
      ORDER BY year DESC
    `;

    return rows.map((r) => ({
      year: Number(r.year),
      count: Number(r.count),
      total_sales: Number(r.total_sales ?? 0),
      total_settled: Number(r.total_settled ?? 0),
      total_fee: Number(r.total_fee ?? 0),
      succeeded_amount: Number(r.succeeded_amount ?? 0),
      pending_amount: Number(r.pending_amount ?? 0),
    }));
  },
};
