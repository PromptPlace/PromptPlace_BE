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
import eventBus from "../../config/eventBus";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

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

    return followers
      .filter((f) => f.follower) // null 체크
      .map((f) => ({
        follow_id: f.follow_id,
        follower_id: f.follower_id,
        nickname: f.follower!.nickname,
        email: f.follower!.email,
        follower_cnt: f.follower_cnt,
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

    return followings
      .filter((f) => f.following) // null 체크
      .map((f) => ({
        follow_id: f.follow_id,
        following_id: f.following_id,
        nickname: f.following!.nickname,
        email: f.following!.email,
        following_cnt: f.following_cnt,
        created_at: f.created_at,
        updated_at: f.updated_at,
      }));
  }

  async getMyPrompts(userId: number, cursor?: number, limit?: number) {
    const DEFAULT_LIMIT = 10;
    const actualLimit =
      limit && limit > 0 && limit <= 50 ? limit : DEFAULT_LIMIT;

    return await this.memberRepository.getMyPrompts(userId, cursor, actualLimit);
  }

  async getMemberPrompts(memberId: number, cursor?: number, limit?: number) {
    const DEFAULT_LIMIT = 10;
    const actualLimit =
      limit && limit > 0 && limit <= 50 ? limit : DEFAULT_LIMIT;

    return await getMemberPromptsRepo(memberId, cursor, actualLimit);
  }

  async getMemberById(memberId: number) {
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
      profile_image: member.profileImage?.url || null, // 프로필 이미지 추가
      created_at: member.created_at,
      updated_at: member.updated_at,
      status: member.status ? 1 : 0,
      role: member.role,
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
        "Forbidden"
      );
    }

    return this.memberRepository.deleteHistory(historyId);
  }

  async adminDeleteHistory(historyId: number) {
    const history = await this.memberRepository.findHistoryById(historyId);
    if (!history) {
      throw new AppError("해당 이력을 찾을 수 없습니다.", 404, "NotFound");
    }
    return this.memberRepository.adminDeleteHistory(historyId);
  }

  async getHistories(requesterId: number, memberId: number) {
    const user = await this.memberRepository.findUserById(memberId);
    if (!user) {
      throw new AppError("해당 회원을 찾을 수 없습니다.", 404, "NotFound");
    }

    return await this.memberRepository.findHistoriesByUserId(memberId);
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

  /**
   * 프로필 이미지 업로드 (파일을 S3에 업로드)
   */
  async uploadProfileImage(userId: number, file: Express.Multer.File) {
    // 파일 확장자 추출
    const ext = file.originalname.split(".").pop();
    const newKey = `profile-images/${uuidv4()}_${Date.now()}.${ext}`;

    // S3 클라이언트 생성
    const s3 = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });

    // S3에 파일 업로드
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: newKey,
      Body: file.buffer, // multer.memoryStorage() 사용 시
      ContentType: file.mimetype,
    });

    await s3.send(uploadCommand);

    // S3 URL 생성
    const imageUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${newKey}`;

    // 데이터베이스에 저장
    await this.memberRepository.upsertProfileImage(userId, imageUrl);

    return { url: imageUrl, key: newKey };
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
    const follow = await this.memberRepository.createFollow(
      followerId,
      followingId
    );

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

  async getAllMembers(page: number = 1, limit: number = 20) {
    // 관리자 권한 확인은 컨트롤러에서 처리
    if (page < 1) {
      throw new AppError(
        "페이지 번호는 1 이상이어야 합니다.",
        400,
        "BadRequest"
      );
    }

    if (limit < 1 || limit > 100) {
      throw new AppError(
        "페이지당 조회할 회원 수는 1-100 사이여야 합니다.",
        400,
        "BadRequest"
      );
    }

    return await this.memberRepository.findAllMembers(page, limit);
  }
}
