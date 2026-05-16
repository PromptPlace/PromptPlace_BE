export type SignupChannel = 'email' | 'google' | 'kakao' | 'naver';

export interface SignupChannelStats {
  count: number;
  ratio: number;
}

export interface MemberStatsResponse {
  total_members: number;
  by_signup_channel: Record<SignupChannel, SignupChannelStats>;
}
