import { AdminVisitorStatsRepository } from '../repositories/admin-visitor-stats.repository';
import { AppError } from '../../errors/AppError';
import { toKstDateString } from '../../utils/visitor-tracking';
import {
  VisitorDailyBucket,
  VisitorStatsResponse,
} from '../dtos/admin-stats.dto';

const WINDOW_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const round4 = (value: number): number => Math.round(value * 10000) / 10000;

const buildDateRange = (startDate: Date, days: number): string[] => {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate.getTime() + i * DAY_MS);
    dates.push(toKstDateString(d));
  }
  return dates;
};

const buildMonthDates = (month: string): string[] => {
  if (!MONTH_PATTERN.test(month)) {
    throw new AppError(
      'month 파라미터는 YYYY-MM 형식이어야 합니다.',
      400,
      'ValidationError',
    );
  }
  const [year, mon] = month.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(year, mon, 0)).getUTCDate();
  const dates: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${month}-${String(day).padStart(2, '0')}`;
    dates.push(dateStr);
  }
  return dates;
};

export const getVisitorStats = async (
  monthParam?: string,
): Promise<VisitorStatsResponse> => {
  const now = new Date();
  const todayKst = toKstDateString(now);

  const currentStart = new Date(now.getTime() - WINDOW_DAYS * DAY_MS);
  const previousStart = new Date(
    currentStart.getTime() - WINDOW_DAYS * DAY_MS,
  );

  const currentDates = buildDateRange(currentStart, WINDOW_DAYS);
  const previousDates = buildDateRange(previousStart, WINDOW_DAYS);

  const [daily_count, current_count, previous_count] = await Promise.all([
    AdminVisitorStatsRepository.countUniqueOnDate(todayKst),
    AdminVisitorStatsRepository.countUniqueOverRange(currentDates),
    AdminVisitorStatsRepository.countUniqueOverRange(previousDates),
  ]);

  const change_rate =
    previous_count === 0
      ? null
      : round4((current_count - previous_count) / previous_count);

  let month: string | null = null;
  let month_total: number | null = null;
  let month_daily: VisitorDailyBucket[] | null = null;

  if (monthParam) {
    const monthDates = buildMonthDates(monthParam);
    const [total, dailyBuckets] = await Promise.all([
      AdminVisitorStatsRepository.countUniqueOverRange(monthDates),
      AdminVisitorStatsRepository.countUniquePerDay(monthDates),
    ]);
    month = monthParam;
    month_total = total;
    month_daily = dailyBuckets;
  }

  return {
    daily_count,
    window_days: WINDOW_DAYS,
    current_count,
    previous_count,
    change_rate,
    month,
    month_total,
    month_daily,
  };
};
