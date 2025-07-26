import { CreateHistoryDto } from '../dtos/create-history.dto';
import { UpdateHistoryDto } from '../dtos/update-history.dto';
import prisma from '../../config/prisma';
import { CreateSnsDto } from '../dtos/create-sns.dto';
import { UpdateSnsDto } from '../dtos/update-sns.dto';

export class MemberRepository {
  async findMemberById(userId: number) {
    const member = await prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        intro: true, // UserIntro 정보 포함
      },
    });
    return member;
  }

  async upsertProfileImage(userId: number, imageUrl: string): Promise<void> {
    await prisma.userImage.upsert({
      where: { userId },
      update: { url: imageUrl },
      create: { userId, url: imageUrl },
    });
  }

  async softDeleteUser(userId: number): Promise<void> {
    await prisma.user.update({
      where: { user_id: userId },
      data: {
        status: false,
        inactive_date: new Date(),
      },
    });
  }

  async upsertUserIntro(userId: number, intro: string) {
    return prisma.userIntro.upsert({
      where: { user_id: userId },
      update: { description: intro },
      create: { user_id: userId, description: intro },
    });
  }

  async updateUserIntro(userId: number, intro: string) {
    return prisma.userIntro.update({
      where: { user_id: userId },
      data: { description: intro },
    });
  }

  async createHistory(userId: number, history: string) {
    return prisma.userHistory.create({
      data: {
        user_id: userId,
        history: history,
      },
    });
  }

  async findHistoryById(historyId: number) {
    return prisma.userHistory.findUnique({
      where: { history_id: historyId },
    });
  }

  async updateHistory(historyId: number, userId: number, history: string) {
    return prisma.userHistory.update({
      where: {
        history_id: historyId,
        user_id: userId,
      },
      data: {
        history: history,
      },
    });
  }

  async deleteHistory(historyId: number, userId: number) {
    return prisma.userHistory.delete({
      where: {
        history_id: historyId,
        user_id: userId,
      },
    });
  }

  async createSns(userId: number, createSnsDto: CreateSnsDto) {
    const { url, description } = createSnsDto;

    return prisma.userSNS.create({
      data: {
        user_id: userId,
        url,
        description,
      },
    });
  }

  async findSnsById(snsId: number) {
    return prisma.userSNS.findUnique({
      where: { sns_id: snsId },
    });
  }

  async updateSns(snsId: number, updateSnsDto: UpdateSnsDto) {
    return prisma.userSNS.update({
      where: { sns_id: snsId },
      data: updateSnsDto,
    });
  }

  async deleteSns(snsId: number) {
    return prisma.userSNS.delete({
      where: { sns_id: snsId },
    });
  }

  async getSnsListByUserId(userId: number) {
    return prisma.userSNS.findMany({
      where: { user_id: userId },
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
}