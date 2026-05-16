export type SignupChannel = 'email' | 'google' | 'kakao' | 'naver';

export interface SignupChannelStats {
  count: number;
  ratio: number;
}

export interface MemberStatsResponse {
  total_members: number;
  by_signup_channel: Record<SignupChannel, SignupChannelStats>;
}

export interface ActiveUserStatsResponse {
  window_days: number;
  current_count: number;
  previous_count: number;
  change_rate: number | null;
}
