import { AdminPromptStatsRepository } from '../repositories/admin-prompt-stats.repository';
import {
  DailyUploadBucket,
  NewPromptStatsResponse,
  TopSalesPromptsResponse,
} from '../dtos/admin-prompt-stats.dto';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const TOP_SALES_PERIOD_DAYS = 30;
const TOP_SALES_LIMIT = 5;

const toKstDateString = (date: Date): string => {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
};

const startOfKstDay = (kstDateString: string): Date => {
  return new Date(`${kstDateString}T00:00:00+09:00`);
};

const buildLast7KstDates = (now: Date): string[] => {
  const todayKst = toKstDateString(now);
  const [year, month, day] = todayKst.split('-').map(Number);
  const dates: string[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(Date.UTC(year, month - 1, day - offset));
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
};

export const getNewPromptStats = async (): Promise<NewPromptStatsResponse> => {
  const now = new Date();
  const dates = buildLast7KstDates(now);
  const windowStart = startOfKstDay(dates[0]);

  const prompts =
    await AdminPromptStatsRepository.findActivePromptCreatedAtsSince(
      windowStart,
    );

  const buckets: Record<string, number> = Object.fromEntries(
    dates.map((d) => [d, 0]),
  );
  for (const p of prompts) {
    const key = toKstDateString(p.created_at);
    if (key in buckets) {
      buckets[key]++;
    }
  }

  const daily_uploads: DailyUploadBucket[] = dates.map((date) => ({
    date,
    count: buckets[date],
  }));

  const weekly_count = daily_uploads.reduce((sum, b) => sum + b.count, 0);

  const last24hStart = new Date(now.getTime() - DAY_MS);
  const daily_count = prompts.filter(
    (p) => p.created_at.getTime() >= last24hStart.getTime(),
  ).length;

  return {
    daily_count,
    weekly_count,
    daily_uploads,
  };
};

export const getTopSalesPrompts = async (): Promise<TopSalesPromptsResponse> => {
  const since = new Date(Date.now() - TOP_SALES_PERIOD_DAYS * DAY_MS);

  const grouped =
    await AdminPromptStatsRepository.groupPaidPurchaseAmountSince(
      since,
      TOP_SALES_LIMIT,
    );

  const titles = await AdminPromptStatsRepository.findPromptTitlesByIds(
    grouped.map((g) => g.prompt_id),
  );
  const titleMap = new Map(titles.map((t) => [t.prompt_id, t.title]));

  return {
    period_days: TOP_SALES_PERIOD_DAYS,
    items: grouped.map((g, idx) => ({
      rank: idx + 1,
      prompt_id: g.prompt_id,
      title: titleMap.get(g.prompt_id) ?? null,
      total_sales: g._sum.amount ?? 0,
    })),
  };
};
