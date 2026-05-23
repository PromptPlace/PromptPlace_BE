import prisma from '../../config/prisma';
import { PayoutStatus, Status } from '@prisma/client';

export const SettlementPayoutRepository = {
  // 활성 판매자(승인 + is_active + 빌링키 보유) 목록.
  async findEligibleSellers() {
    return prisma.settlementAccount.findMany({
      where: {
        status: 'APPROVED',
        is_active: true,
        billing_tran_id: { not: null },
      },
      select: {
        user_id: true,
        billing_tran_id: true,
      },
    });
  },

  // 직전 사이클 payout의 net 음수 이월액(절댓값). 없으면 0.
  async getCarryOverFromLastPayout(userId: number): Promise<number> {
    const last = await prisma.settlementPayout.findFirst({
      where: { user_id: userId },
      orderBy: { cycle_start: 'desc' },
      select: { amount_net: true },
    });
    if (!last) return 0;
    return last.amount_net < 0 ? Math.abs(last.amount_net) : 0;
  },

  // 사이클 범위 내 gross(Succeed) / refund(Refunded) 집계.
  async aggregateUnsettledForCycle(
    userId: number,
    cycleStart: Date,
    cycleEnd: Date,
  ): Promise<{ gross: number; refund: number }> {
    const rows = await prisma.$queryRaw<
      Array<{ gross: bigint | null; refund: bigint | null }>
    >`
      SELECT
        SUM(CASE WHEN status = ${Status.Succeed} THEN amount ELSE 0 END) AS gross,
        SUM(CASE WHEN status = ${Status.Refunded} THEN amount ELSE 0 END) AS refund
      FROM Settlement
      WHERE user_id = ${userId}
        AND updated_at >= ${cycleStart}
        AND updated_at < ${cycleEnd}
    `;
    const r = rows[0] ?? {};
    return {
      gross: Number(r.gross ?? 0),
      refund: Number(r.refund ?? 0),
    };
  },

  // 멱등성: 같은 user_id + cycle_start로 한 번만 생성.
  async createPendingPayout(input: {
    userId: number;
    cycleStart: Date;
    cycleEnd: Date;
    amountGross: number;
    amountRefund: number;
    carryOverPrev: number;
    amountNet: number;
    billingTranId: string | null;
    status: PayoutStatus;
    reason?: string | null;
  }) {
    return prisma.settlementPayout.upsert({
      where: { user_id_cycle_start: { user_id: input.userId, cycle_start: input.cycleStart } },
      update: {}, // 이미 있으면 그대로 — 멱등성
      create: {
        user_id: input.userId,
        cycle_start: input.cycleStart,
        cycle_end: input.cycleEnd,
        amount_gross: input.amountGross,
        amount_refund: input.amountRefund,
        carry_over_prev: input.carryOverPrev,
        amount_net: input.amountNet,
        billing_tran_id: input.billingTranId,
        status: input.status,
        reason: input.reason ?? null,
      },
    });
  },

  async updatePaypleGroupKey(payoutId: number, groupKey: string) {
    return prisma.settlementPayout.update({
      where: { payout_id: payoutId },
      data: { group_key: groupKey },
    });
  },

  async markFailed(payoutId: number, reason: string) {
    return prisma.settlementPayout.update({
      where: { payout_id: payoutId },
      data: { status: 'Failed', reason, completed_at: new Date() },
    });
  },

  // Webhook 수신용 — group_key 또는 billing_tran_id로 매칭.
  async findPayoutByGroupKey(groupKey: string) {
    return prisma.settlementPayout.findFirst({
      where: { group_key: groupKey, status: 'Pending' },
    });
  },

  async markSucceeded(payoutId: number, apiTranId: string) {
    return prisma.settlementPayout.update({
      where: { payout_id: payoutId },
      data: { status: 'Succeed', api_tran_id: apiTranId, completed_at: new Date() },
    });
  },
};
