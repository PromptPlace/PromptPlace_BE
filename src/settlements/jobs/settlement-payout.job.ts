import cron from 'node-cron';
import { runPayoutCycle } from '../services/settlement-payout.service';

// 매월 15일 KST 09:00 — 정산 사이클 (#491 PR D).
// 안내 사항: "정산일은 매월 15일이며, 이전 한 달 동안의 수익이 정산됩니다."
const CRON_EXPRESSION = '0 9 15 * *';
const TIMEZONE = 'Asia/Seoul';

export const startSettlementPayoutJob = (): void => {
  cron.schedule(
    CRON_EXPRESSION,
    async () => {
      try {
        await runPayoutCycle();
      } catch (error) {
        console.error('[payout-cron] scheduled run failed', error);
      }
    },
    { timezone: TIMEZONE },
  );

  console.log('[payout-cron] scheduled', {
    cron: CRON_EXPRESSION,
    timezone: TIMEZONE,
  });
};
