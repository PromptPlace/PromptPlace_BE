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
    return prisma.following.findMany({
      where: {
        following_id: memberId,
      },
      select: {
        follow_id: true,
        follower_id: true,
        created_at: true,
        updated_at: true,
        follower: {
          select: {
            nickname: true,
            email: true,
          },
        },
      },
    });
  }

  async findFollowingsByMemberId(memberId: number) {
    return prisma.following.findMany({
      where: {
        follower_id: memberId,
      },
      select: {
        follow_id: true,
        following_id: true,
        created_at: true,
        updated_at: true,
        following: {
          select: {
            nickname: true,
            email: true,
          },
        },
      },
    });
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
