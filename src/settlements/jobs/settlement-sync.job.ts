import cron from 'node-cron';
import { runSettlementSyncJob } from '../services/settlement-sync.service';

// KST 08:00에 어제 정산일 기준 동기화.
// Payple 정산 확정 시각은 명세상 불분명 — sandbox 검증 후 cron 표현식 조정 가능.
const CRON_EXPRESSION = '0 8 * * *';
const TIMEZONE = 'Asia/Seoul';

export const startSettlementSyncJob = (): void => {
  cron.schedule(
    CRON_EXPRESSION,
    async () => {
      try {
        await runSettlementSyncJob();
      } catch (error) {
        console.error('[settlement-sync-cron] scheduled run failed', error);
      }
    },
    { timezone: TIMEZONE },
  );

  console.log('[settlement-sync-cron] scheduled', {
    cron: CRON_EXPRESSION,
    timezone: TIMEZONE,
  });
};
