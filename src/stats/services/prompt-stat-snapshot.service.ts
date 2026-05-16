import prisma from '../../config/prisma';
import { toKstDateString } from '../../utils/visitor-tracking';

const SNAPSHOT_RETENTION_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

export const snapshotAllPromptStats = async (
  date: Date = new Date(),
): Promise<{ snapshotted: number }> => {
  const snapshot_date = toKstDateString(date);

  const prompts = await prisma.prompt.findMany({
    select: { prompt_id: true, views: true, downloads: true },
  });

  if (prompts.length === 0) return { snapshotted: 0 };

  const result = await prisma.promptStatDaily.createMany({
    data: prompts.map((p) => ({
      prompt_id: p.prompt_id,
      snapshot_date,
      views: p.views,
      downloads: p.downloads,
    })),
    skipDuplicates: true,
  });

  return { snapshotted: result.count };
};

export const cleanupOldSnapshots = async (
  now: Date = new Date(),
): Promise<{ deleted: number }> => {
  const cutoff = toKstDateString(
    new Date(now.getTime() - SNAPSHOT_RETENTION_DAYS * DAY_MS),
  );

  const result = await prisma.promptStatDaily.deleteMany({
    where: { snapshot_date: { lt: cutoff } },
  });

  return { deleted: result.count };
};

export const runDailyPromptStatJob = async (): Promise<void> => {
  const startedAt = Date.now();
  const snap = await snapshotAllPromptStats();
  const cleanup = await cleanupOldSnapshots();
  const elapsedMs = Date.now() - startedAt;
  console.log('[prompt-stat-cron] daily job completed', {
    snapshotted: snap.snapshotted,
    deleted: cleanup.deleted,
    elapsed_ms: elapsedMs,
  });
};

export const ensureTodaySnapshot = async (): Promise<void> => {
  const today = toKstDateString(new Date());
  const exists = await prisma.promptStatDaily.count({
    where: { snapshot_date: today },
  });
  if (exists > 0) return;

  try {
    await runDailyPromptStatJob();
  } catch (error) {
    console.error('[prompt-stat-cron] startup snapshot failed', error);
  }
};
