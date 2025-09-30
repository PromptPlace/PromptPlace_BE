import { Service } from "typedi";
import { CreateHistoryDto } from "../dtos/create-history.dto";
import { UpdateHistoryDto } from "../dtos/update-history.dto";
import prisma from "../../config/prisma";
import { CreateSnsDto } from "../dtos/create-sns.dto";
import { UpdateSnsDto } from "../dtos/update-sns.dto";
import { User } from "@prisma/client";
import { UpdateMemberDto } from "../dtos/update-member.dto";

@Service()
export class MemberRepository {
  async findUserByNickname(nickname: string) {
    return prisma.user.findFirst({ where: { nickname } });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async updateUser(userId: number, updateMemberDto: UpdateMemberDto) {
    return prisma.user.update({
      where: { user_id: userId },
      data: updateMemberDto,
    });
  }

  async upsertIntro(userId: number, intro: string) {
    return prisma.userIntro.upsert({
      where: { user_id: userId },
      update: { description: intro },
      create: {
        user_id: userId,
        description: intro,
      },
    });
  }

  async findIntroByUserId(userId: number) {
    return prisma.userIntro.findUnique({
      where: { user_id: userId },
    });
  }

  async updateIntro(userId: number, intro: string) {
    return prisma.userIntro.update({
      where: { user_id: userId },
      data: { description: intro },
    });
  }

  async findSnsByUserId(userId: number) {
    return await prisma.userSNS.findMany({ where: { user_id: userId } });
  }

  async createSns(userId: number, createSnsDto: CreateSnsDto) {
    return await prisma.userSNS.create({
      data: {
        user_id: userId,
        ...createSnsDto,
      },
    });
  }

  async updateSns(snsId: number, updateSnsDto: UpdateSnsDto) {
    return await prisma.userSNS.update({
      where: { sns_id: snsId },
      data: updateSnsDto,
    });
  }

  async deleteSns(snsId: number) {
    return await prisma.userSNS.delete({ where: { sns_id: snsId } });
  }

  async findSnsById(snsId: number) {
    return prisma.userSNS.findUnique({ where: { sns_id: snsId } });
  }

  async findHistoryById(historyId: number) {
    return prisma.userHistory.findUnique({
      where: { history_id: historyId },
    });
  }

  async findHistoriesByUserId(userId: number) {
    return await prisma.userHistory.findMany({ where: { user_id: userId } });
  }

  async createHistory(userId: number, createHistoryDto: CreateHistoryDto) {
    return await prisma.userHistory.create({
      data: {
        user_id: userId,
        ...createHistoryDto,
      },
    });
  }

  async updateHistory(historyId: number, updateHistoryDto: UpdateHistoryDto) {
    return await prisma.userHistory.update({
      where: { history_id: historyId },
      data: updateHistoryDto,
    });
  }

  async deleteHistory(historyId: number) {
    return await prisma.userHistory.delete({
      where: { history_id: historyId },
    });
  }

  async adminDeleteHistory(historyId: number) {
    return await prisma.userHistory.delete({
      where: { history_id: historyId },
    });
  }

  async upsertProfileImage(userId: number, imageUrl: string) {
    return prisma.userImage.upsert({
      where: { userId: userId },
      update: { url: imageUrl },
      create: {
        userId: userId,
        url: imageUrl,
      },
    });
  }

  async findFollow(followerId: number, followingId: number) {
    return prisma.following.findFirst({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });
  }

  async createFollow(followerId: number, followingId: number) {
    return prisma.following.create({
      data: {
        follower_id: followerId,
        following_id: followingId,
      },
    });
  }

  async deleteFollow(followId: number) {
    return prisma.following.delete({
      where: { follow_id: followId },
    });
  }

  async deactivateUser(userId: number) {
    await prisma.$executeRawUnsafe(
      "UPDATE `User` SET status = 0, inactive_date = NOW() WHERE user_id = ?",
      userId
    );
    return prisma.user.findUnique({
      where: { user_id: userId },
    });
  }

  async findPurchasesByUserId(userId: number) {
    return prisma.purchase.findMany({
      where: { user_id: userId },
      include: {
        prompt: {
          select: {
            title: true,
            description: true,
          },
        },
      },
    });
  }

  async findPromptsByUserId(userId: number) {
    return prisma.prompt.findMany({
      where: { user_id: userId },
    });
  }

  async findWithdrawalsByUserId(userId: number) {
    return prisma.withdrawRequest.findMany({
      where: { user_id: userId },
    });
  }

  async findUserById(memberId: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { user_id: memberId },
    });
  }

  async findUserWithIntroById(memberId: number) {
    return prisma.user.findUnique({
      where: { user_id: memberId },
      include: {
        intro: true,
        profileImage: true, // 프로필 이미지 포함
      },
    });
  }

  async findFollowing(followerId: number, followingId: number) {
    return prisma.following.findFirst({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });
  }

  async followUser(followerId: number, followingId: number) {
    return prisma.following.create({
      data: {
        follower_id: followerId,
        following_id: followingId,
      },
    });
  }

  async unfollowUser(followerId: number, followingId: number) {
    return prisma.following.deleteMany({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });
  }

  async findFollowersByMemberId(memberId: number) {
    const followings = await prisma.following.findMany({
      where: {
        following_id: memberId,
      },
      select: {
        follow_id: true,
        follower_id: true,
        created_at: true,
        updated_at: true,
      },
    });

    // follower 정보를 별도로 가져오기
    const followingsWithFollower = await Promise.all(
      followings.map(async (following) => {
        const follower = await prisma.user.findUnique({
          where: { user_id: following.follower_id },
          select: { nickname: true, email: true },
        });

        const followerCount = await prisma.following.count({
          where: { following_id: following.follower_id },
        });

        return {
          ...following,
          follower,
          follower_cnt: followerCount,
        };
      })
    );

    return followingsWithFollower;
  }

  async findFollowingsByMemberId(memberId: number) {
    const followings = await prisma.following.findMany({
      where: {
        follower_id: memberId,
      },
      select: {
        follow_id: true,
        following_id: true,
        created_at: true,
        updated_at: true,
      },
    });

    // following 정보를 별도로 가져오기
    const followingsWithFollowing = await Promise.all(
      followings.map(async (following) => {
        const followingUser = await prisma.user.findUnique({
          where: { user_id: following.following_id },
          select: { nickname: true, email: true },
        });

        const followerCount = await prisma.following.count({
          where: { following_id: following.following_id },
        });

        return {
          ...following,
          following: followingUser,
          following_cnt: followerCount,
        };
      })
    );

    return followingsWithFollowing;
  }

  async findAllMembers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          status: true, // 활성화된 회원만 조회
        },
        select: {
          user_id: true,
          nickname: true,
          created_at: true,
          updated_at: true,
          profileImage: {
            select: {
              url: true,
            },
          },
        },
        orderBy: {
          created_at: "desc", // 최신 가입순
        },
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: {
          status: true,
        },
      }),
    ]);

    // 각 멤버의 팔로워 수를 별도로 계산
    const membersWithFollowerCount = await Promise.all(
      members.map(async (member) => {
        const followerCount = await prisma.following.count({
          where: { following_id: member.user_id },
        });

        return {
          user_id: member.user_id,
          nickname: member.nickname,
          created_at: member.created_at,
          updated_at: member.updated_at,
          follower_cnt: followerCount,
          profile_image_url: member.profileImage?.url || null, // 이미 S3 URL이 저장되어 있음
        };
      })
    );

    return {
      members: membersWithFollowerCount,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }
}

export const getMemberPromptsRepo = async (
  memberId: number,
  cursor?: number,
  limit: number = 10
) => {
  const whereCondition: any = { user_id: memberId };

  // 커서가 있으면 해당 ID보다 작은 것들만 조회 (최신순이므로)
  if (cursor) {
    whereCondition.prompt_id = { lt: cursor };
  }

  // limit + 1개를 가져와서 다음 페이지 존재 여부 확인
  const prompts = await prisma.prompt.findMany({
    where: whereCondition,
    select: {
      prompt_id: true,
      title: true,
      models: {
        select: {
          model: {
            select: { name: true },
          },
        },
      },
      tags: {
        select: {
          tag: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { prompt_id: "desc" }, // 최신순 (ID 내림차순)
    take: limit + 1,
  });

  const hasNext = prompts.length > limit;
  const resultPrompts = hasNext ? prompts.slice(0, limit) : prompts;
  const nextCursor = hasNext
    ? resultPrompts[resultPrompts.length - 1].prompt_id
    : null;

  return {
    prompts: resultPrompts,
    has_more: hasNext,
    nextCursor,
  };
};
