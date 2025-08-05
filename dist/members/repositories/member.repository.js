"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemberPromptsRepo = exports.MemberRepository = void 0;
const typedi_1 = require("typedi");
const prisma_1 = __importDefault(require("../../config/prisma"));
let MemberRepository = class MemberRepository {
    findUserByNickname(nickname) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.findFirst({ where: { nickname } });
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.findUnique({ where: { email } });
        });
    }
    updateUser(userId, updateMemberDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.update({
                where: { user_id: userId },
                data: updateMemberDto,
            });
        });
    }
    upsertIntro(userId, intro) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.userIntro.upsert({
                where: { user_id: userId },
                update: { description: intro },
                create: {
                    user_id: userId,
                    description: intro,
                },
            });
        });
    }
    findIntroByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.userIntro.findUnique({
                where: { user_id: userId },
            });
        });
    }
    updateIntro(userId, intro) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.userIntro.update({
                where: { user_id: userId },
                data: { description: intro },
            });
        });
    }
    findSnsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.userSNS.findMany({ where: { user_id: userId } });
        });
    }
    createSns(userId, createSnsDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.userSNS.create({
                data: Object.assign({ user_id: userId }, createSnsDto),
            });
        });
    }
    updateSns(snsId, updateSnsDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.userSNS.update({
                where: { sns_id: snsId },
                data: updateSnsDto,
            });
        });
    }
    deleteSns(snsId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.userSNS.delete({ where: { sns_id: snsId } });
        });
    }
    findSnsById(snsId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.userSNS.findUnique({ where: { sns_id: snsId } });
        });
    }
    findHistoryById(historyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.userHistory.findUnique({
                where: { history_id: historyId },
            });
        });
    }
    findHistoriesByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.userHistory.findMany({ where: { user_id: userId } });
        });
    }
    createHistory(userId, createHistoryDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.userHistory.create({
                data: Object.assign({ user_id: userId }, createHistoryDto),
            });
        });
    }
    updateHistory(historyId, updateHistoryDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.userHistory.update({
                where: { history_id: historyId },
                data: updateHistoryDto,
            });
        });
    }
    deleteHistory(historyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.userHistory.delete({
                where: { history_id: historyId },
            });
        });
    }
    upsertProfileImage(userId, imageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.userImage.upsert({
                where: { userId: userId },
                update: { url: imageUrl },
                create: {
                    userId: userId,
                    url: imageUrl,
                },
            });
        });
    }
    findFollow(followerId, followingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.following.findFirst({
                where: {
                    follower_id: followerId,
                    following_id: followingId,
                },
            });
        });
    }
    createFollow(followerId, followingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.following.create({
                data: {
                    follower_id: followerId,
                    following_id: followingId,
                },
            });
        });
    }
    deleteFollow(followId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.following.delete({
                where: { follow_id: followId },
            });
        });
    }
    deactivateUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.update({
                where: { user_id: userId },
                data: {
                    status: false,
                    inactive_date: new Date(),
                },
            });
        });
    }
    findPurchasesByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.purchase.findMany({
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
        });
    }
    findPromptsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.prompt.findMany({
                where: { user_id: userId },
            });
        });
    }
    findWithdrawalsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.withdrawRequest.findMany({
                where: { user_id: userId },
            });
        });
    }
    findUserById(memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.findUnique({
                where: { user_id: memberId },
            });
        });
    }
    findUserWithIntroById(memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.findUnique({
                where: { user_id: memberId },
                include: {
                    intro: true,
                },
            });
        });
    }
    findFollowing(followerId, followingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.following.findFirst({
                where: {
                    follower_id: followerId,
                    following_id: followingId,
                },
            });
        });
    }
    followUser(followerId, followingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.following.create({
                data: {
                    follower_id: followerId,
                    following_id: followingId,
                },
            });
        });
    }
    unfollowUser(followerId, followingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.following.deleteMany({
                where: {
                    follower_id: followerId,
                    following_id: followingId,
                },
            });
        });
    }
    findFollowersByMemberId(memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.following.findMany({
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
        });
    }
    findFollowingsByMemberId(memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.following.findMany({
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
        });
    }
};
exports.MemberRepository = MemberRepository;
exports.MemberRepository = MemberRepository = __decorate([
    (0, typedi_1.Service)()
], MemberRepository);
const getMemberPromptsRepo = (memberId_1, cursor_1, ...args_1) => __awaiter(void 0, [memberId_1, cursor_1, ...args_1], void 0, function* (memberId, cursor, limit = 10) {
    const whereCondition = { user_id: memberId };
    // 커서가 있으면 해당 ID보다 작은 것들만 조회 (최신순이므로)
    if (cursor) {
        whereCondition.prompt_id = { lt: cursor };
    }
    // limit + 1개를 가져와서 다음 페이지 존재 여부 확인
    const prompts = yield prisma_1.default.prompt.findMany({
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
});
exports.getMemberPromptsRepo = getMemberPromptsRepo;
