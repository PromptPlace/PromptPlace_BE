import redisClient from '../../config/redis';
import { buildHllKey } from '../../utils/visitor-tracking';

export const AdminVisitorStatsRepository = {
  countUniqueOnDate: async (kstDate: string): Promise<number> => {
    return Number(await redisClient.pfCount(buildHllKey(kstDate)));
  },

  countUniqueOverRange: async (kstDates: string[]): Promise<number> => {
    if (kstDates.length === 0) return 0;
    const keys = kstDates.map(buildHllKey);
    return Number(await redisClient.pfCount(keys));
  },

  countUniquePerDay: async (
    kstDates: string[],
  ): Promise<{ date: string; count: number }[]> => {
    if (kstDates.length === 0) return [];
    const counts = await Promise.all(
      kstDates.map((d) => redisClient.pfCount(buildHllKey(d))),
    );
    return kstDates.map((date, i) => ({ date, count: Number(counts[i]) }));
  },
};
