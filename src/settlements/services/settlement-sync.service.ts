import prisma from '../../config/prisma';
import redisClient from '../../config/redis';
import {
  fetchPaypleSettlements,
  PaypleSettlementItem,
} from '../utils/payple-settlement';

// 정산 완료 동기화 잡 — Payple 정산내역 조회 결과를 우리 Settlement에 반영.
//
// 정책 (#482 확정 사항):
//  - APPROVAL만 처리. CANCEL은 skip + WARN (환불은 별도 이슈)
//  - 금액 검증: PCD_SETTLE_AMOUNT === Settlement.amount일 때만 Succeed 전이
//  - 멱등 가드: WHERE status='Pending' updateMany — 재실행 안전
//  - 분산 락: Redis SET NX EX 600 — 컨테이너 중복 실행 방지
//  - 페이지 사이 1.1초 sleep (Payple 1초 1회 한도)
//  - 페이지 한도 도달 시 lastKey 영속화 → 다음 cron이 이어받기

const SYNC_LOCK_KEY = 'payple:settlement:sync:lock';
const SYNC_LOCK_TTL_SECONDS = 600;
const LAST_KEY_PREFIX = 'payple:settlement:sync:lastkey';
const LAST_KEY_TTL_SECONDS = 24 * 60 * 60;
const RATE_LIMIT_SLEEP_MS = 1100;
const DEFAULT_MAX_PAGES_PER_RUN = 100;
const DEFAULT_PAGE_LIMIT = 3000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const formatKstDate = (date: Date): string => {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kst = new Date(date.getTime() + kstOffsetMs);
  const yyyy = kst.getUTCFullYear();
  const mm = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(kst.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getYesterdayKst = (now: Date = new Date()): string => {
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return formatKstDate(yesterday);
};

interface SyncCounters {
  date: string;
  pages: number;
  processed: number;
  updated: number;
  skipped: number;
  missing: number;
  cancel_skipped: number;
  discrepancy: number;
  failed: number;
}

const newCounters = (date: string): SyncCounters => ({
  date,
  pages: 0,
  processed: 0,
  updated: 0,
  skipped: 0,
  missing: 0,
  cancel_skipped: 0,
  discrepancy: 0,
  failed: 0,
});

// APPROVAL 한 건 처리. counters는 mutable.
const processApproval = async (item: PaypleSettlementItem, counters: SyncCounters): Promise<void> => {
  const payment = await prisma.payment.findUnique({
    where: { pcd_pay_oid: item.payOid },
    select: { payment_id: true, settlement: { select: { amount: true, status: true } } },
  });

  if (!payment) {
    counters.missing += 1;
    console.warn('[settlement-sync] missing payment for OID', { payOid: item.payOid });
    return;
  }
  if (!payment.settlement) {
    counters.missing += 1;
    console.warn('[settlement-sync] missing settlement for payment', {
      payOid: item.payOid,
      paymentId: payment.payment_id,
    });
    return;
  }
  if (payment.settlement.amount !== item.settleAmount) {
    counters.discrepancy += 1;
    console.error('[settlement-sync] amount discrepancy — manual review required', {
      payOid: item.payOid,
      paymentId: payment.payment_id,
      ourAmount: payment.settlement.amount,
      paypleAmount: item.settleAmount,
    });
    return;
  }

  // 멱등 가드: Pending 행만 Succeed로
  const result = await prisma.settlement.updateMany({
    where: { payment_id: payment.payment_id, status: 'Pending' },
    data: { status: 'Succeed' },
  });

  if (result.count > 0) {
    counters.updated += 1;
  } else {
    counters.skipped += 1;
  }
};

interface RunOptions {
  date?: string;
  maxPagesPerRun?: number;
  pageLimit?: number;
}

// 단일 날짜에 대한 동기화 1회 실행.
// 본 함수는 분산 락 안에서만 호출되어야 한다.
export const runSettlementSyncForDate = async (
  options: RunOptions = {},
): Promise<SyncCounters> => {
  const date = options.date ?? getYesterdayKst();
  const maxPages = options.maxPagesPerRun ?? DEFAULT_MAX_PAGES_PER_RUN;
  const pageLimit = options.pageLimit ?? DEFAULT_PAGE_LIMIT;
  const counters = newCounters(date);
  const lastKeyKey = `${LAST_KEY_PREFIX}:${date}`;

  let lastKey = (await redisClient.get(lastKeyKey)) ?? undefined;

  for (let page = 0; page < maxPages; page += 1) {
    if (page > 0) await sleep(RATE_LIMIT_SLEEP_MS);

    let response;
    try {
      response = await fetchPaypleSettlements({
        startDate: date,
        endDate: date,
        limit: pageLimit,
        lastKey: lastKey,
      });
    } catch (err: any) {
      counters.failed += 1;
      console.error('[settlement-sync] page fetch failed', {
        date,
        page,
        error: err?.message,
      });
      // 페이지 실패 시 lastKey 보존 (다음 cron이 이어받음) 후 종료
      break;
    }

    counters.pages += 1;

    for (const item of response.items) {
      counters.processed += 1;
      try {
        if (item.txnType === 'CANCEL') {
          counters.cancel_skipped += 1;
          console.warn('[settlement-sync] CANCEL skipped (handled in separate flow)', {
            payOid: item.payOid,
          });
          continue;
        }
        if (item.txnType === 'APPROVAL') {
          await processApproval(item, counters);
          continue;
        }
        // 알 수 없는 txnType
        counters.failed += 1;
        console.error('[settlement-sync] unknown txnType', {
          payOid: item.payOid,
          txnType: item.txnType,
        });
      } catch (err: any) {
        counters.failed += 1;
        console.error('[settlement-sync] item processing failed', {
          payOid: item.payOid,
          error: err?.message,
        });
      }
    }

    if (!response.hasMore || !response.lastKey) {
      // 완료 — lastKey 캐시 제거
      await redisClient.del(lastKeyKey);
      lastKey = undefined;
      break;
    }

    lastKey = response.lastKey;
    await redisClient.set(lastKeyKey, lastKey, { EX: LAST_KEY_TTL_SECONDS });
  }

  return counters;
};

// cron 진입점 — 분산 락 + 환경 토글 + 결과 로그.
export const runSettlementSyncJob = async (): Promise<void> => {
  if (process.env.PAYPLE_SETTLEMENT_SYNC_ENABLED === 'false') {
    console.log('[settlement-sync] disabled by env');
    return;
  }

  const lockAcquired = await redisClient.set(SYNC_LOCK_KEY, '1', {
    NX: true,
    EX: SYNC_LOCK_TTL_SECONDS,
  });
  if (lockAcquired !== 'OK') {
    console.warn('[settlement-sync] lock held by another instance — skip this run');
    return;
  }

  const startedAt = Date.now();
  try {
    const maxPages = process.env.PAYPLE_SETTLEMENT_SYNC_MAX_PAGES_PER_RUN
      ? Number(process.env.PAYPLE_SETTLEMENT_SYNC_MAX_PAGES_PER_RUN)
      : undefined;
    const counters = await runSettlementSyncForDate({ maxPagesPerRun: maxPages });
    console.log('[settlement-sync] completed', {
      ...counters,
      elapsedMs: Date.now() - startedAt,
    });
  } catch (err: any) {
    console.error('[settlement-sync] job failed', { error: err?.message });
  } finally {
    await redisClient.del(SYNC_LOCK_KEY);
  }
};
