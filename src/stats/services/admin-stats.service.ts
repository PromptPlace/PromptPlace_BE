import { AdminStatsRepository } from '../repositories/admin-stats.repository';
import {
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
