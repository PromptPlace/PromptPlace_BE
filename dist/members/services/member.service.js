"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
exports.MemberService = void 0;
const member_repository_1 = require("../repositories/member.repository");
const AppError_1 = require("../../errors/AppError");
const typedi_1 = require("typedi");
const member_repository_2 = require("../repositories/member.repository");
const eventBus_1 = __importDefault(require("../../config/eventBus"));
let MemberService = class MemberService {
    constructor(memberRepository) {
        this.memberRepository = memberRepository;
    }
    followUser(followerId, followingId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (followerId === followingId) {
                throw new AppError_1.AppError("자기 자신을 팔로우할 수 없습니다.", 400, "BadRequest");
            }
            const followingUser = yield this.memberRepository.findUserById(followingId);
            if (!followingUser) {
                throw new AppError_1.AppError("해당 사용자를 찾을 수 없습니다.", 404, "NotFound");
            }
            const existingFollow = yield this.memberRepository.findFollowing(followerId, followingId);
            if (existingFollow) {
                throw new AppError_1.AppError("이미 팔로우한 사용자입니다.", 409, "Conflict");
            }
            return this.memberRepository.followUser(followerId, followingId);
        });
    }
    unfollowUser(followerId, followingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const following = yield this.memberRepository.findFollowing(followerId, followingId);
            if (!following) {
                throw new AppError_1.AppError("팔로우 관계를 찾을 수 없습니다.", 404, "NotFound");
            }
            yield this.memberRepository.unfollowUser(followerId, followingId);
            return { message: "언팔로우 성공" };
        });
    }
    getFollowers(memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.memberRepository.findUserById(memberId);
            if (!user) {
                throw new AppError_1.AppError("해당 사용자를 찾을 수 없습니다.", 404, "NotFound");
            }
            const followers = yield this.memberRepository.findFollowersByMemberId(memberId);
            return followers.map((f) => ({
                follow_id: f.follow_id,
                follower_id: f.follower_id,
                nickname: f.follower.nickname,
                email: f.follower.email,
                created_at: f.created_at,
                updated_at: f.updated_at,
            }));
        });
    }
    getFollowings(memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.memberRepository.findUserById(memberId);
            if (!user) {
                throw new AppError_1.AppError("해당 사용자를 찾을 수 없습니다.", 404, "NotFound");
            }
            const followings = yield this.memberRepository.findFollowingsByMemberId(memberId);
            return followings.map((f) => ({
                follow_id: f.follow_id,
                following_id: f.following_id,
                nickname: f.following.nickname,
                email: f.following.email,
                created_at: f.created_at,
                updated_at: f.updated_at,
            }));
        });
    }
    getMemberPrompts(memberId, cursor, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const DEFAULT_LIMIT = 10;
            const actualLimit = limit && limit > 0 && limit <= 50 ? limit : DEFAULT_LIMIT;
            return yield (0, member_repository_2.getMemberPromptsRepo)(memberId, cursor, actualLimit);
        });
    }
    getMemberById(requesterId, memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (requesterId !== memberId) {
                throw new AppError_1.AppError("해당 회원 정보에 접근할 권한이 없습니다.", 403, "Forbidden");
            }
            const member = yield this.memberRepository.findUserWithIntroById(memberId);
            if (!member) {
                throw new AppError_1.AppError("해당 회원을 찾을 수 없습니다.", 404, "NotFound");
            }
            return {
                member_id: member.user_id,
                email: member.email,
                name: member.name,
                nickname: member.nickname,
                intros: ((_a = member.intro) === null || _a === void 0 ? void 0 : _a.description) || null,
                created_at: member.created_at,
                updated_at: member.updated_at,
                status: member.status ? 1 : 0,
            };
        });
    }
    updateMember(userId, updateMemberDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nickname, email } = updateMemberDto;
            if (nickname) {
                const existingUser = yield this.memberRepository.findUserByNickname(nickname);
                if (existingUser && existingUser.user_id !== userId) {
                    throw new AppError_1.AppError("이미 사용 중인 닉네임입니다.", 409, "Conflict");
                }
            }
            if (email) {
                const existingUser = yield this.memberRepository.findUserByEmail(email);
                if (existingUser && existingUser.user_id !== userId) {
                    throw new AppError_1.AppError("이미 사용 중인 이메일입니다.", 409, "Conflict");
                }
            }
            const updatedUser = yield this.memberRepository.updateUser(userId, updateMemberDto);
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
        });
    }
    createOrUpdateIntro(userId, createIntroDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.memberRepository.upsertIntro(userId, createIntroDto.intro);
        });
    }
    updateIntro(userId, updateIntroDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingIntro = yield this.memberRepository.findIntroByUserId(userId);
            if (!existingIntro) {
                throw new AppError_1.AppError("수정할 한줄 소개를 찾을 수 없습니다.", 404, "NotFound");
            }
            return this.memberRepository.updateIntro(userId, updateIntroDto.intro);
        });
    }
    createHistory(userId, createHistoryDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.memberRepository.createHistory(userId, createHistoryDto);
        });
    }
    updateHistory(userId, historyId, updateHistoryDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const history = yield this.memberRepository.findHistoryById(historyId);
            if (!history) {
                throw new AppError_1.AppError("해당 이력을 찾을 수 없습니다.", 404, "NotFound");
            }
            if (history.user_id !== userId) {
                throw new AppError_1.AppError("해당 이력을 수정할 권한이 없습니다.", 403, "Forbidden");
            }
            return this.memberRepository.updateHistory(historyId, updateHistoryDto);
        });
    }
    deleteHistory(userId, historyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const history = yield this.memberRepository.findHistoryById(historyId);
            if (!history) {
                throw new AppError_1.AppError("해당 이력을 찾을 수 없습니다.", 404, "NotFound");
            }
            if (history.user_id !== userId) {
                throw new AppError_1.AppError("해당 이력을 삭제할 권한이 없습니다.", 403, "Forbidden");
            }
            return this.memberRepository.deleteHistory(historyId);
        });
    }
    getHistories(requesterId, memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (requesterId !== memberId) {
                throw new AppError_1.AppError("해당 회원의 이력을 조회할 권한이 없습니다.", 403, "Forbidden");
            }
            const user = yield this.memberRepository.findUserById(memberId);
            if (!user) {
                throw new AppError_1.AppError("해당 회원을 찾을 수 없습니다.", 404, "NotFound");
            }
            const purchases = yield this.memberRepository.findPurchasesByUserId(memberId);
            const uploads = yield this.memberRepository.findPromptsByUserId(memberId);
            const withdrawals = yield this.memberRepository.findWithdrawalsByUserId(memberId);
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
            allHistories.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
            return allHistories;
        });
    }
    createSns(userId, createSnsDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.memberRepository.createSns(userId, createSnsDto);
        });
    }
    updateSns(userId, snsId, updateSnsDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const sns = yield this.memberRepository.findSnsById(snsId);
            if (!sns) {
                throw new AppError_1.AppError("해당 SNS를 찾을 수 없습니다.", 404, "NotFound");
            }
            if (sns.user_id !== userId) {
                throw new AppError_1.AppError("해당 SNS를 수정할 권한이 없습니다.", 403, "Forbidden");
            }
            return this.memberRepository.updateSns(snsId, updateSnsDto);
        });
    }
    deleteSns(userId, snsId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sns = yield this.memberRepository.findSnsById(snsId);
            if (!sns) {
                throw new AppError_1.AppError("해당 SNS 정보를 찾을 수 없습니다.", 404, "NotFound");
            }
            if (sns.user_id !== userId) {
                throw new AppError_1.AppError("해당 SNS 정보를 삭제할 권한이 없습니다.", 403, "Forbidden");
            }
            return this.memberRepository.deleteSns(snsId);
        });
    }
    getSnsList(memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.memberRepository.findUserById(memberId);
            if (!user) {
                throw new AppError_1.AppError("해당 회원을 찾을 수 없습니다.", 404, "NotFound");
            }
            return this.memberRepository.findSnsByUserId(memberId);
        });
    }
    uploadProfileImage(userId, imageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.memberRepository.upsertProfileImage(userId, imageUrl);
        });
    }
    followMember(followerId, followingId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. 자기 자신 팔로우 불가
            if (followerId === followingId) {
                throw new AppError_1.AppError("자기 자신을 팔로우할 수 없습니다.", 400, "BadRequest");
            }
            // 2. 팔로우할 사용자가 존재하는지 확인
            const followingUser = yield this.memberRepository.findUserById(followingId);
            if (!followingUser) {
                throw new AppError_1.AppError("해당 사용자를 찾을 수 없습니다.", 404, "NotFound");
            }
            // 3. 이미 팔로우하고 있는지 확인
            const existingFollow = yield this.memberRepository.findFollow(followerId, followingId);
            if (existingFollow) {
                throw new AppError_1.AppError("이미 팔로우한 사용자입니다.", 409, "Conflict");
            }
            // 팔로우 생성
            const follow = yield this.memberRepository.createFollow(followerId, followingId);
            // 팔로우 알림 이벤트 발생
            eventBus_1.default.emit("follow.created", followerId, followingId);
            return follow;
        });
    }
    unfollowMember(followerId, followingId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. 언팔로우할 사용자가 존재하는지 확인
            const followingUser = yield this.memberRepository.findUserById(followingId);
            if (!followingUser) {
                throw new AppError_1.AppError("해당 사용자를 찾을 수 없습니다.", 404, "NotFound");
            }
            // 2. 팔로우 관계가 존재하는지 확인
            const existingFollow = yield this.memberRepository.findFollow(followerId, followingId);
            if (!existingFollow) {
                throw new AppError_1.AppError("팔로우 관계를 찾을 수 없습니다.", 404, "NotFound");
            }
            // 팔로우 관계 삭제
            return this.memberRepository.deleteFollow(existingFollow.follow_id);
        });
    }
    withdrawMember(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.memberRepository.findUserById(userId);
            // findUserById가 null을 반환할 수 없다고 가정 (authenticateJwt 미들웨어에서 거르므로)
            // 하지만 안전을 위해 체크
            if (!user) {
                throw new AppError_1.AppError("해당 사용자를 찾을 수 없습니다.", 404, "NotFound");
            }
            // 이미 탈퇴한 회원인지 확인
            if (!user.status) {
                throw new AppError_1.AppError("이미 탈퇴한 회원입니다.", 400, "BadRequest");
            }
            // 회원 비활성화
            return this.memberRepository.deactivateUser(userId);
        });
    }
};
exports.MemberService = MemberService;
exports.MemberService = MemberService = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [member_repository_1.MemberRepository])
], MemberService);
