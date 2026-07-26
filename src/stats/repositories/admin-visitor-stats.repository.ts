import redisClient from '../../config/redis';
import { buildHllKey } from '../../utils/visitor-tracking';

const REDIS_TIMEOUT_MS = 2000;

// ponytail: Redis 장애 시 응답이 hang 되지 않도록 짧은 타임아웃 + 폴백. 근본 복구는 인프라 몫.
const withTimeout = <T>(op: Promise<T>, fallback: T): Promise<T> =>
  Promise.race([
    op,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), REDIS_TIMEOUT_MS)),
  ]);

export const AdminVisitorStatsRepository = {
  countUniqueOnDate: async (kstDate: string): Promise<number> => {
    return withTimeout(
      redisClient.pfCount(buildHllKey(kstDate)).then(Number),
      0,
    );
  },

  countUniqueOverRange: async (kstDates: string[]): Promise<number> => {
    if (kstDates.length === 0) return 0;
    const keys = kstDates.map(buildHllKey);
    return withTimeout(redisClient.pfCount(keys).then(Number), 0);
  },

  countUniquePerDay: async (
    kstDates: string[],
  ): Promise<{ date: string; count: number }[]> => {
    if (kstDates.length === 0) return [];
    const counts = await Promise.all(
      kstDates.map((d) =>
        withTimeout(redisClient.pfCount(buildHllKey(d)).then(Number), 0),
      ),
    );
    return kstDates.map((date, i) => ({ date, count: counts[i] }));
  },
};
