import { MemberRepository } from '../repositories/member.repository';
import { AppError } from '../../errors/AppError';
import { Service } from 'typedi';

@Service()
export class MemberService {
  constructor(private memberRepository: MemberRepository) {}

  async followUser(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new AppError('BadRequest', '자기 자신을 팔로우할 수 없습니다.', 400);
    }

    const followingUser = await this.memberRepository.findUserById(followingId);
    if (!followingUser) {
      throw new AppError('NotFound', '해당 사용자를 찾을 수 없습니다.', 404);
    }

    const existingFollow = await this.memberRepository.findFollowing(followerId, followingId);
    if (existingFollow) {
      throw new AppError('Conflict', '이미 팔로우한 사용자입니다.', 409);
    }

    return this.memberRepository.followUser(followerId, followingId);
  }

  async unfollowUser(followerId: number, followingId: number) {
    const following = await this.memberRepository.findFollowing(followerId, followingId);

    if (!following) {
      throw new AppError('NotFound', '팔로우 관계를 찾을 수 없습니다.', 404);
    }
    await this.memberRepository.unfollowUser(followerId, followingId);
    return { message: '언팔로우 성공' };
  }

  async getFollowers(memberId: number) {
    const user = await this.memberRepository.findUserById(memberId);
    if (!user) {
      throw new AppError('NotFound', '해당 사용자를 찾을 수 없습니다.', 404);
    }

    const followers = await this.memberRepository.findFollowersByMemberId(memberId);

    return followers.map((f) => ({
      follow_id: f.follow_id,
      follower_id: f.follower_id,
      nickname: f.follower.nickname,
      email: f.follower.email,
      created_at: f.created_at,
      updated_at: f.updated_at,
    }));
  }
} 