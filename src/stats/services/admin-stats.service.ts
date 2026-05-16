import { AdminStatsRepository } from '../repositories/admin-stats.repository';
import {
  ActiveUserStatsResponse,
  MemberStatsResponse,
  SignupChannel,
  SignupChannelStats,
} from '../dtos/admin-stats.dto';

const SOCIAL_TYPE_TO_CHANNEL: Record<string, SignupChannel> = {
  NONE: 'email',
  GOOGLE: 'google',
  KAKAO: 'kakao',
  NAVER: 'naver',
};

const emptyChannelStats = (): Record<SignupChannel, SignupChannelStats> => ({
  email: { count: 0, ratio: 0 },
  google: { count: 0, ratio: 0 },
  kakao: { count: 0, ratio: 0 },
  naver: { count: 0, ratio: 0 },
});

const round4 = (value: number): number => Math.round(value * 10000) / 10000;

export const getMemberStats = async (): Promise<MemberStatsResponse> => {
  const grouped = await AdminStatsRepository.countMembersBySocialType();

  const byChannel = emptyChannelStats();
  let total = 0;

  for (const row of grouped) {
    const channel = SOCIAL_TYPE_TO_CHANNEL[row.social_type];
    if (!channel) continue;
    byChannel[channel].count = row._count._all;
    total += row._count._all;
  }

  if (total > 0) {
    (Object.keys(byChannel) as SignupChannel[]).forEach((channel) => {
      byChannel[channel].ratio = round4(byChannel[channel].count / total);
    });
  }

  return {
    total_members: total,
    by_signup_channel: byChannel,
  };
};

const ACTIVE_WINDOW_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export const getActiveUserStats = async (): Promise<ActiveUserStatsResponse> => {
  const now = new Date();
  const currentStart = new Date(now.getTime() - ACTIVE_WINDOW_DAYS * DAY_MS);
  const previousStart = new Date(
    currentStart.getTime() - ACTIVE_WINDOW_DAYS * DAY_MS,
  );

  const [current_count, previous_count] = await Promise.all([
    AdminStatsRepository.countActiveUsersInRange(currentStart, now),
    AdminStatsRepository.countActiveUsersInRange(previousStart, currentStart),
  ]);

  const change_rate =
    previous_count === 0
      ? null
      : round4((current_count - previous_count) / previous_count);

  return {
    window_days: ACTIVE_WINDOW_DAYS,
    current_count,
    previous_count,
    change_rate,
  };
};
