import { MemberRepository } from "../repositories/member.repository";
import { AppError } from "../../errors/AppError";
import { Service } from "typedi";
import { getMemberPromptsRepo } from "../repositories/member.repository";
import { UpdateMemberDto } from "../dtos/update-member.dto";
import { CreateIntroDto } from "../dtos/create-intro.dto";
import { UpdateIntroDto } from "../dtos/update-intro.dto";
import { CreateHistoryDto } from "../dtos/create-history.dto";
import { UpdateHistoryDto } from "../dtos/update-history.dto";
import { CreateSnsDto } from "../dtos/create-sns.dto";
import { UpdateSnsDto } from "../dtos/update-sns.dto";
import eventBus from '../../config/eventBus';
@Service()
export class MemberService {
  constructor(private memberRepository: MemberRepository) {}

  async followUser(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new AppError(
        "자기 자신을 팔로우할 수 없습니다.",
        400,
        "BadRequest"
      );
    }

    const followingUser = await this.memberRepository.findUserById(followingId);
    if (!followingUser) {
      throw new AppError("해당 사용자를 찾을 수 없습니다.", 404, "NotFound");
    }

    const existingFollow = await this.memberRepository.findFollowing(
      followerId,
      followingId
    );
    if (existingFollow) {
      throw new AppError("이미 팔로우한 사용자입니다.", 409, "Conflict");
    }

    return this.memberRepository.followUser(followerId, followingId);
  }

  async unfollowUser(followerId: number, followingId: number) {
    const following = await this.memberRepository.findFollowing(
      followerId,
      followingId
    );

    if (!following) {
      throw new AppError("팔로우 관계를 찾을 수 없습니다.", 404, "NotFound");
    }
    await this.memberRepository.unfollowUser(followerId, followingId);
    return { message: "언팔로우 성공" };
  }

  async getFollowers(memberId: number) {
    const user = await this.memberRepository.findUserById(memberId);
    if (!user) {
      throw new AppError("해당 사용자를 찾을 수 없습니다.", 404, "NotFound");
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
      throw new AppError("해당 사용자를 찾을 수 없습니다.", 404, "NotFound");
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
        "해당 회원 정보에 접근할 권한이 없습니다.",
        403,
        "Forbidden"
      );
    }

    const member = await this.memberRepository.findUserWithIntroById(memberId);

    if (!member) {
      throw new AppError("해당 회원을 찾을 수 없습니다.", 404, "NotFound");
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
        throw new AppError("이미 사용 중인 닉네임입니다.", 409, "Conflict");
      }
    }

    if (email) {
      const existingUser = await this.memberRepository.findUserByEmail(email);
      if (existingUser && existingUser.user_id !== userId) {
        throw new AppError("이미 사용 중인 이메일입니다.", 409, "Conflict");
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
        "수정할 한줄 소개를 찾을 수 없습니다.",
        404,
        "NotFound"
      );
    }

    return this.memberRepository.updateIntro(userId, updateIntroDto.intro);
  }

  async createHistory(userId: number, createHistoryDto: CreateHistoryDto) {
    return this.memberRepository.createHistory(userId, createHistoryDto);
  }

  async updateHistory(
    userId: number,
    historyId: number,
    updateHistoryDto: UpdateHistoryDto
  ) {
    const history = await this.memberRepository.findHistoryById(historyId);

    if (!history) {
      throw new AppError("해당 이력을 찾을 수 없습니다.", 404, "NotFound");
    }

    if (history.user_id !== userId) {
      throw new AppError(
        "해당 이력을 수정할 권한이 없습니다.",
        403,
        "Forbidden"
      );
    }

    return this.memberRepository.updateHistory(historyId, updateHistoryDto);
  }

  async deleteHistory(userId: number, historyId: number) {
    const history = await this.memberRepository.findHistoryById(historyId);

    if (!history) {
      throw new AppError("해당 이력을 찾을 수 없습니다.", 404, "NotFound");
    }

    if (history.user_id !== userId) {
      throw new AppError(
        "해당 이력을 삭제할 권한이 없습니다.",
        403,
        "Forbidden",
      );
    }

    return this.memberRepository.deleteHistory(historyId);
  }

  async getHistories(requesterId: number, memberId: number) {
    if (requesterId !== memberId) {
      throw new AppError(
        "해당 회원의 이력을 조회할 권한이 없습니다.",
        403,
        "Forbidden"
      );
    }

    const user = await this.memberRepository.findUserById(memberId);
    if (!user) {
      throw new AppError("해당 회원을 찾을 수 없습니다.", 404, "NotFound");
    }

    const purchases = await this.memberRepository.findPurchasesByUserId(
      memberId
    );
    const uploads = await this.memberRepository.findPromptsByUserId(memberId);
    const withdrawals = await this.memberRepository.findWithdrawalsByUserId(
      memberId
    );

    const purchaseHistories = purchases.map((p) => ({
      type: "PROMPT_PURCHASE",
      title: `${p.prompt.title} 구매`,
      description: p.prompt.description,
      amount: p.amount,
      created_at: p.created_at,
    }));

    const uploadHistories = uploads.map((p) => ({
      type: "PROMPT_UPLOAD",
      title: `${p.title} 업로드`,
      description: p.description,
      amount: 0,
      created_at: p.created_at,
    }));

    const withdrawalHistories = withdrawals.map((w) => ({
      type: "WITHDRAWAL",
      title: "수익 출금 요청",
      description: "프롬프트 판매 수익 출금",
      amount: w.amount,
      created_at: w.created_at,
    }));

    const allHistories = [
      ...purchaseHistories,
      ...uploadHistories,
      ...withdrawalHistories,
    ];

    allHistories.sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime()
    );

    return allHistories;
  }

  async createSns(userId: number, createSnsDto: CreateSnsDto) {
    return this.memberRepository.createSns(userId, createSnsDto);
  }

  async updateSns(userId: number, snsId: number, updateSnsDto: UpdateSnsDto) {
    const sns = await this.memberRepository.findSnsById(snsId);

    if (!sns) {
      throw new AppError("해당 SNS를 찾을 수 없습니다.", 404, "NotFound");
    }

    if (sns.user_id !== userId) {
      throw new AppError(
        "해당 SNS를 수정할 권한이 없습니다.",
        403,
        "Forbidden"
      );
    }

    return this.memberRepository.updateSns(snsId, updateSnsDto);
  }

  async deleteSns(userId: number, snsId: number) {
    const sns = await this.memberRepository.findSnsById(snsId);

    if (!sns) {
      throw new AppError("해당 SNS 정보를 찾을 수 없습니다.", 404, "NotFound");
    }

    if (sns.user_id !== userId) {
      throw new AppError(
        "해당 SNS 정보를 삭제할 권한이 없습니다.",
        403,
        "Forbidden"
      );
    }

    return this.memberRepository.deleteSns(snsId);
  }

  async getSnsList(memberId: number) {
    const user = await this.memberRepository.findUserById(memberId);
    if (!user) {
      throw new AppError("해당 회원을 찾을 수 없습니다.", 404, "NotFound");
    }

    return this.memberRepository.findSnsByUserId(memberId);
  }

  async uploadProfileImage(userId: number, imageUrl: string) {
    return this.memberRepository.upsertProfileImage(userId, imageUrl);
  }

  async followMember(followerId: number, followingId: number) {
    // 1. 자기 자신 팔로우 불가
    if (followerId === followingId) {
      throw new AppError(
        "자기 자신을 팔로우할 수 없습니다.",
        400,
        "BadRequest"
      );
    }

    // 2. 팔로우할 사용자가 존재하는지 확인
    const followingUser = await this.memberRepository.findUserById(followingId);
    if (!followingUser) {
      throw new AppError("해당 사용자를 찾을 수 없습니다.", 404, "NotFound");
    }

    // 3. 이미 팔로우하고 있는지 확인
    const existingFollow = await this.memberRepository.findFollow(
      followerId,
      followingId
    );
    if (existingFollow) {
      throw new AppError("이미 팔로우한 사용자입니다.", 409, "Conflict");
    }

    // 팔로우 생성
    const follow = await this.memberRepository.createFollow(followerId, followingId);

    // 팔로우 알림 이벤트 발생
    eventBus.emit("follow.created", followerId, followingId);

    return follow;
  }

  async unfollowMember(followerId: number, followingId: number) {
    // 1. 언팔로우할 사용자가 존재하는지 확인
    const followingUser = await this.memberRepository.findUserById(followingId);
    if (!followingUser) {
      throw new AppError("해당 사용자를 찾을 수 없습니다.", 404, "NotFound");
    }

    // 2. 팔로우 관계가 존재하는지 확인
    const existingFollow = await this.memberRepository.findFollow(
      followerId,
      followingId
    );
    if (!existingFollow) {
      throw new AppError("팔로우 관계를 찾을 수 없습니다.", 404, "NotFound");
    }

    // 팔로우 관계 삭제
    return this.memberRepository.deleteFollow(existingFollow.follow_id);
  }

  async withdrawMember(userId: number) {
    const user = await this.memberRepository.findUserById(userId);
    // findUserById가 null을 반환할 수 없다고 가정 (authenticateJwt 미들웨어에서 거르므로)
    // 하지만 안전을 위해 체크
    if (!user) {
      throw new AppError("해당 사용자를 찾을 수 없습니다.", 404, "NotFound");
    }

    // 이미 탈퇴한 회원인지 확인
    if (!user.status) {
      throw new AppError("이미 탈퇴한 회원입니다.", 400, "BadRequest");
    }

    // 회원 비활성화
    return this.memberRepository.deactivateUser(userId);
  }
}
