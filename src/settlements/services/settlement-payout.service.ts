import redisClient from '../../config/redis';
import { SettlementPayoutRepository } from '../repositories/settlement-payout.repository';
import { requestPayoutStandby, executePayout } from '../utils/payple-payout';

// 정산 사이클 cron — 매월 15일 KST 09:00.
// 정책 (#491):
//  - 사이클 범위: 직전 15일 KST 00:00 ~ 이번 15일 KST 00:00 (직전 한 달)
//  - 최소 지급액: 10,000원 미만이면 Skipped + 이월
//  - 잔액 음수 시: 다음 사이클로 이월 (carry_over_prev로 차감)
//  - 빌링키 미보유: Skipped + 이월 (재인증 안내는 별도)
//  - 분산 락: Redis SET NX EX 1800
//
// Webhook 수신 시 결과를 Succeed/Failed로 마감 (별도 controller).

const CYCLE_LOCK_KEY = 'payple:payout:cycle:lock';
const CYCLE_LOCK_TTL_SECONDS = 30 * 60;
const MIN_PAYOUT_AMOUNT = 10_000;

// 매월 15일 KST 00:00 계산
const getCycleBoundaries = (now: Date = new Date()): { cycleStart: Date; cycleEnd: Date } => {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const nowKst = new Date(now.getTime() + kstOffsetMs);
  const year = nowKst.getUTCFullYear();
  const month = nowKst.getUTCMonth(); // 0-indexed
  // 이번 15일 KST 00:00 (UTC로는 14일 15:00)
  const cycleEndUtc = new Date(Date.UTC(year, month, 15) - kstOffsetMs);
  // 직전 15일 KST 00:00
  const cycleStartUtc = new Date(Date.UTC(year, month - 1, 15) - kstOffsetMs);
  return { cycleStart: cycleStartUtc, cycleEnd: cycleEndUtc };
};

interface CycleCounters {
  total_sellers: number;
  paid: number;
  skipped_min: number;
  skipped_no_key: number;
  failed: number;
}

const processOneSeller = async (
  seller: { user_id: number; billing_tran_id: string | null },
  cycle: { cycleStart: Date; cycleEnd: Date },
  counters: CycleCounters,
): Promise<void> => {
  const { gross, refund } = await SettlementPayoutRepository.aggregateUnsettledForCycle(
    seller.user_id,
    cycle.cycleStart,
    cycle.cycleEnd,
  );
  const carryOverPrev = await SettlementPayoutRepository.getCarryOverFromLastPayout(seller.user_id);
  const amountNet = gross - refund - carryOverPrev;

  // 빌링키 미보유
  if (!seller.billing_tran_id) {
    await SettlementPayoutRepository.createPendingPayout({
      userId: seller.user_id,
      cycleStart: cycle.cycleStart,
      cycleEnd: cycle.cycleEnd,
      amountGross: gross,
      amountRefund: refund,
      carryOverPrev,
      amountNet,
      billingTranId: null,
      status: 'Skipped',
      reason: '빌링키 미보유 — 계좌 재인증 필요',
    });
    counters.skipped_no_key += 1;
    return;
  }

  // 최소 금액 미달 (음수도 포함)
  if (amountNet < MIN_PAYOUT_AMOUNT) {
    await SettlementPayoutRepository.createPendingPayout({
      userId: seller.user_id,
      cycleStart: cycle.cycleStart,
      cycleEnd: cycle.cycleEnd,
      amountGross: gross,
      amountRefund: refund,
      carryOverPrev,
      amountNet,
      billingTranId: seller.billing_tran_id,
      status: 'Skipped',
      reason: amountNet < 0
        ? `음수 잔액 이월 (${amountNet}원)`
        : `최소 지급액(${MIN_PAYOUT_AMOUNT}원) 미달`,
    });
    counters.skipped_min += 1;
    return;
  }

  // Payple 이체 대기 요청 + 즉시 실행
  const payout = await SettlementPayoutRepository.createPendingPayout({
    userId: seller.user_id,
    cycleStart: cycle.cycleStart,
    cycleEnd: cycle.cycleEnd,
    amountGross: gross,
    amountRefund: refund,
    carryOverPrev,
    amountNet,
    billingTranId: seller.billing_tran_id,
    status: 'Pending',
  });

  try {
    const standby = await requestPayoutStandby({
      billingTranId: seller.billing_tran_id,
      tranAmt: amountNet,
      subId: `user_${seller.user_id}`,
      distinctKey: `payout-${payout.payout_id}`,
    });
    await SettlementPayoutRepository.updatePaypleGroupKey(payout.payout_id, standby.groupKey);

    await executePayout({
      groupKey: standby.groupKey,
      billingTranId: seller.billing_tran_id,
      executeType: 'NOW',
      webhookUrl: process.env.PAYPLE_PAYOUT_WEBHOOK_URL,
    });
    // 결과는 Webhook이 수신해서 Succeed/Failed로 마감
    counters.paid += 1;
  } catch (err: any) {
    console.error('[payout-cycle] payple call failed', {
      userId: seller.user_id,
      payoutId: payout.payout_id,
      error: err?.message,
    });
    await SettlementPayoutRepository.markFailed(payout.payout_id, err?.message ?? 'Payple 호출 실패');
    counters.failed += 1;
  }
};

export const runPayoutCycle = async (): Promise<void> => {
  if (process.env.PAYPLE_PAYOUT_CYCLE_ENABLED === 'false') {
    console.log('[payout-cycle] disabled by env');
    return;
  }

  const lockAcquired = await redisClient.set(CYCLE_LOCK_KEY, '1', {
    NX: true,
    EX: CYCLE_LOCK_TTL_SECONDS,
  });
  if (lockAcquired !== 'OK') {
    console.warn('[payout-cycle] lock held by another instance — skip this run');
    return;
  }

  const startedAt = Date.now();
  try {
    const cycle = getCycleBoundaries();
    const sellers = await SettlementPayoutRepository.findEligibleSellers();
    const counters: CycleCounters = {
      total_sellers: sellers.length,
      paid: 0,
      skipped_min: 0,
      skipped_no_key: 0,
      failed: 0,
    };

    for (const seller of sellers) {
      try {
        await processOneSeller(seller, cycle, counters);
      } catch (err: any) {
        counters.failed += 1;
        console.error('[payout-cycle] seller processing failed', {
          userId: seller.user_id,
          error: err?.message,
        });
      }
    }

    console.log('[payout-cycle] completed', {
      cycle_start: cycle.cycleStart.toISOString(),
      cycle_end: cycle.cycleEnd.toISOString(),
      ...counters,
      elapsedMs: Date.now() - startedAt,
    });
  } catch (err: any) {
    console.error('[payout-cycle] cycle failed', { error: err?.message });
  } finally {
    await redisClient.del(CYCLE_LOCK_KEY);
  }
};
