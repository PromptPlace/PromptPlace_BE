import cron from 'node-cron';
import {
  ensureTodaySnapshot,
  runDailyPromptStatJob,
} from '../services/prompt-stat-snapshot.service';

const CRON_EXPRESSION = '0 0 * * *';
const TIMEZONE = 'Asia/Seoul';

export const startPromptStatSnapshotJob = (): void => {
  void ensureTodaySnapshot();

  cron.schedule(
    CRON_EXPRESSION,
    async () => {
      try {
        await runDailyPromptStatJob();
      } catch (error) {
        console.error('[prompt-stat-cron] scheduled run failed', error);
      }
    },
    { timezone: TIMEZONE },
  );

  console.log('[prompt-stat-cron] scheduled', {
    cron: CRON_EXPRESSION,
    timezone: TIMEZONE,
  });
};
