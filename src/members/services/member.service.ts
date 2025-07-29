import { MemberRepository } from "../repositories/member.repository";
import { AppError } from "../../errors/AppError";
import { Service } from "typedi";
import { getMemberPromptsRepo } from "../repositories/member.repository";
import { UpdateMemberDto } from "../dtos/update-member.dto";
import { CreateIntroDto } from "../dtos/create-intro.dto";
import { CreateHistoryDto } from "../dtos/create-history.dto";

@Service()
export class MemberService {
  constructor(private memberRepository: MemberRepository) {}

  async followUser(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new AppError(
        "BadRequest",
        "자기 자신을 팔로우할 수 없습니다.",
        400
      );
    }

    const followingUser = await this.memberRepository.findUserById(followingId);
    if (!followingUser) {
      throw new AppError("NotFound", "해당 사용자를 찾을 수 없습니다.", 404);
    }

    const existingFollow = await this.memberRepository.findFollowing(
      followerId,
      followingId
    );
    if (existingFollow) {
      throw new AppError("Conflict", "이미 팔로우한 사용자입니다.", 409);
    }

    return this.memberRepository.followUser(followerId, followingId);
  }

  async unfollowUser(followerId: number, followingId: number) {
    const following = await this.memberRepository.findFollowing(
      followerId,
      followingId
    );

    if (!following) {
      throw new AppError("NotFound", "팔로우 관계를 찾을 수 없습니다.", 404);
    }
    await this.memberRepository.unfollowUser(followerId, followingId);
    return { message: "언팔로우 성공" };
  }

  async getFollowers(memberId: number) {
    const user = await this.memberRepository.findUserById(memberId);
    if (!user) {
      throw new AppError("NotFound", "해당 사용자를 찾을 수 없습니다.", 404);
    }

    const followers = await this.memberRepository.findFollowersByMemberId(
      memberId
    );

    return followers.map((f) => ({
      follow_id: f.follow_id,
      follower_id: f.follower_id,
      nickname: f.follower.nickname,
      email: f.follower.email,
      created_at: f.created_at,
      updated_at: f.updated_at,
    }));
  }

  async getFollowings(memberId: number) {
    const user = await this.memberRepository.findUserById(memberId);
    if (!user) {
      throw new AppError("NotFound", "해당 사용자를 찾을 수 없습니다.", 404);
    }

    const followings = await this.memberRepository.findFollowingsByMemberId(
      memberId
    );

    return followings.map((f) => ({
      follow_id: f.follow_id,
      following_id: f.following_id,
      nickname: f.following.nickname,
      email: f.following.email,
      created_at: f.created_at,
      updated_at: f.updated_at,
    }));
  }

  async getMemberPrompts(memberId: number, cursor?: number, limit?: number) {
    const DEFAULT_LIMIT = 10;
    const actualLimit =
      limit && limit > 0 && limit <= 50 ? limit : DEFAULT_LIMIT;

    return await getMemberPromptsRepo(memberId, cursor, actualLimit);
  }

  async getMemberById(requesterId: number, memberId: number) {
    if (requesterId !== memberId) {
      throw new AppError(
        "Forbidden",
        "해당 회원 정보에 접근할 권한이 없습니다.",
        403
      );
    }

    const member = await this.memberRepository.findUserWithIntroById(memberId);

    if (!member) {
      throw new AppError("NotFound", "해당 회원을 찾을 수 없습니다.", 404);
    }

    return {
      member_id: member.user_id,
      email: member.email,
      name: member.name,
      nickname: member.nickname,
      intros: member.intro?.description || null,
      created_at: member.created_at,
      updated_at: member.updated_at,
      status: member.status ? 1 : 0,
    };
  }

  async updateMember(userId: number, updateMemberDto: UpdateMemberDto) {
    const { nickname, email } = updateMemberDto;

    if (nickname) {
      const existingUser = await this.memberRepository.findUserByNickname(
        nickname
      );
      if (existingUser && existingUser.user_id !== userId) {
        throw new AppError("Conflict", "이미 사용 중인 닉네임입니다.", 409);
      }
    }

    if (email) {
      const existingUser = await this.memberRepository.findUserByEmail(email);
      if (existingUser && existingUser.user_id !== userId) {
        throw new AppError("Conflict", "이미 사용 중인 이메일입니다.", 409);
      }
    }

    const updatedUser = await this.memberRepository.updateUser(
      userId,
      updateMemberDto
    );
    return {
      user_id: updatedUser.user_id,
      name: updatedUser.name,
      nickname: updatedUser.nickname,
      email: updatedUser.email,
      social_type: updatedUser.social_type,
      status: updatedUser.status ? "ACTIVE" : "INACTIVE",
      role: updatedUser.role,
      updated_at: updatedUser.updated_at,
    };
  }

  async createOrUpdateIntro(userId: number, createIntroDto: CreateIntroDto) {
    return this.memberRepository.upsertIntro(userId, createIntroDto.intro);
  }

  async updateIntro(userId: number, updateIntroDto: UpdateIntroDto) {
    const existingIntro = await this.memberRepository.findIntroByUserId(userId);
    if (!existingIntro) {
      throw new AppError(
        "NotFound",
        "수정할 한줄 소개를 찾을 수 없습니다.",
        404
      );
    }

    return this.memberRepository.updateIntro(userId, updateIntroDto.intro);
  }

  async createHistory(userId: number, createHistoryDto: CreateHistoryDto) {
    return this.memberRepository.createHistory(userId, createHistoryDto);
  }
}
