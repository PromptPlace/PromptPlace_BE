"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberController = void 0;
const member_service_1 = require("../services/member.service");
const member_repository_1 = require("../repositories/member.repository");
const update_member_dto_1 = require("../dtos/update-member.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AppError_1 = require("../../errors/AppError");
const create_intro_dto_1 = require("../dtos/create-intro.dto");
const update_intro_dto_1 = require("../dtos/update-intro.dto");
const create_history_dto_1 = require("../dtos/create-history.dto");
const update_history_dto_1 = require("../dtos/update-history.dto");
const create_sns_dto_1 = require("../dtos/create-sns.dto");
const update_sns_dto_1 = require("../dtos/update-sns.dto");
class MemberController {
    constructor() {
        this.memberService = new member_service_1.MemberService(new member_repository_1.MemberRepository());
    }
    getFollowers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const memberId = parseInt(req.params.memberId, 10);
                const followers = yield this.memberService.getFollowers(memberId);
                res.status(200).json({
                    message: "팔로워 목록 조회 완료",
                    data: followers,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    followUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const followerId = req.user.user_id;
                const followingId = parseInt(req.params.memberId, 10);
                yield this.memberService.followUser(followerId, followingId);
                res.status(201).json({ message: "팔로우 성공" });
            }
            catch (error) {
                next(error);
            }
        });
    }
    unfollowUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const followerId = req.user.user_id;
                const followingId = parseInt(req.params.memberId, 10);
                yield this.memberService.unfollowUser(followerId, followingId);
                res.status(200).json({ message: "언팔로우 성공" });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getFollowings(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const memberId = parseInt(req.params.memberId, 10);
                const followings = yield this.memberService.getFollowings(memberId);
                res.status(200).json({
                    message: "팔로잉 목록 조회 완료",
                    data: followings,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getMemberPrompts(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { memberId } = req.params;
                const { cursor, limit } = req.query;
                // memberId 검증
                const memberIdNum = parseInt(memberId, 10);
                // 쿼리 파라미터 검증
                const cursorNum = cursor ? parseInt(cursor, 10) : undefined;
                const limitNum = limit ? parseInt(limit, 10) : 10; // 기본값 10
                if (limit && (isNaN(limitNum) || limitNum <= 0 || limitNum > 50)) {
                    res.status(400).json({
                        error: "BadRequest",
                        message: "limit은 1-50 사이의 숫자여야 합니다.",
                        statusCode: 400,
                    });
                    return;
                }
                const result = yield this.memberService.getMemberPrompts(memberIdNum, cursorNum, limitNum);
                res.status(200).json({
                    message: "회원 프롬프트 목록 조회 완료",
                    data: {
                        prompts: result.prompts,
                        pagination: {
                            nextCursor: result.nextCursor,
                            has_more: result.has_more,
                            limit: limitNum,
                        },
                    },
                    statusCode: 200,
                });
            }
            catch (error) {
                // 에러 예외 처리
                if (error instanceof Error) {
                    res.status(500).json({
                        error: "InternalServerError",
                        message: error.message,
                        statusCode: 500,
                    });
                }
                else {
                    res.status(500).json({
                        error: "InternalServerError",
                        message: "알 수 없는 오류가 발생했습니다.",
                        statusCode: 500,
                    });
                }
            }
        });
    }
    getMemberById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterId = req.user.user_id;
                const memberId = parseInt(req.params.memberId, 10);
                const member = yield this.memberService.getMemberById(requesterId, memberId);
                res.status(200).json({
                    message: "회원 정보 조회 완료",
                    data: member,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateMember(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user_id;
                const updateMemberDto = (0, class_transformer_1.plainToInstance)(update_member_dto_1.UpdateMemberDto, req.body);
                const errors = yield (0, class_validator_1.validate)(updateMemberDto);
                if (errors.length > 0) {
                    const message = errors
                        .map((error) => Object.values(error.constraints || {}))
                        .join(", ");
                    throw new AppError_1.AppError(message, 400, "BadRequest");
                }
                const updatedUser = yield this.memberService.updateMember(userId, updateMemberDto);
                res.status(200).json({
                    message: "회원 정보 수정 완료",
                    user: updatedUser,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createOrUpdateIntro(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user_id;
                const createIntroDto = (0, class_transformer_1.plainToInstance)(create_intro_dto_1.CreateIntroDto, req.body);
                const errors = yield (0, class_validator_1.validate)(createIntroDto);
                if (errors.length > 0) {
                    const message = errors
                        .map((error) => Object.values(error.constraints || {}))
                        .join(", ");
                    throw new AppError_1.AppError(message, 400, "BadRequest");
                }
                const result = yield this.memberService.createOrUpdateIntro(userId, createIntroDto);
                res.status(200).json({
                    message: "한줄 소개가 성공적으로 작성되었습니다.",
                    intro: result.description,
                    updated_at: result.updated_at,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateIntro(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user_id;
                const updateIntroDto = (0, class_transformer_1.plainToInstance)(update_intro_dto_1.UpdateIntroDto, req.body);
                const errors = yield (0, class_validator_1.validate)(updateIntroDto);
                if (errors.length > 0) {
                    const message = errors
                        .map((error) => Object.values(error.constraints || {}))
                        .join(", ");
                    throw new AppError_1.AppError(message, 400, "BadRequest");
                }
                const result = yield this.memberService.updateIntro(userId, updateIntroDto);
                res.status(200).json({
                    message: "한줄 소개가 성공적으로 수정되었습니다.",
                    intro: result.description,
                    updated_at: result.updated_at,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createHistory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user_id;
                const createHistoryDto = (0, class_transformer_1.plainToInstance)(create_history_dto_1.CreateHistoryDto, req.body);
                const errors = yield (0, class_validator_1.validate)(createHistoryDto);
                if (errors.length > 0) {
                    const message = errors
                        .map((error) => Object.values(error.constraints || {}))
                        .join(", ");
                    throw new AppError_1.AppError(message, 400, "BadRequest");
                }
                const newHistory = yield this.memberService.createHistory(userId, createHistoryDto);
                res.status(201).json({
                    message: "이력이 성공적으로 작성되었습니다.",
                    history: {
                        history_id: newHistory.history_id,
                        history: newHistory.history,
                    },
                    statusCode: 201,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateHistory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user_id;
                const historyId = parseInt(req.params.historyId, 10);
                const updateHistoryDto = (0, class_transformer_1.plainToInstance)(update_history_dto_1.UpdateHistoryDto, req.body);
                const errors = yield (0, class_validator_1.validate)(updateHistoryDto);
                if (errors.length > 0) {
                    const message = errors
                        .map((error) => Object.values(error.constraints || {}))
                        .join(", ");
                    throw new AppError_1.AppError(message, 400, "BadRequest");
                }
                const updatedHistory = yield this.memberService.updateHistory(userId, historyId, updateHistoryDto);
                res.status(200).json({
                    message: "이력이 성공적으로 수정되었습니다.",
                    history_id: updatedHistory.history_id,
                    history: updatedHistory.history,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteHistory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user_id;
                const historyId = parseInt(req.params.historyId, 10);
                yield this.memberService.deleteHistory(userId, historyId);
                res.status(200).json({
                    message: "이력이 성공적으로 삭제되었습니다.",
                    history_id: historyId,
                    deleted_at: new Date(),
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getHistories(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterId = req.user.user_id;
                const memberId = parseInt(req.params.memberId, 10);
                const histories = yield this.memberService.getHistories(requesterId, memberId);
                res.status(200).json({
                    message: "회원 이력 조회 완료",
                    histories: histories,
                    total_count: histories.length,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createSns(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user_id;
                const createSnsDto = (0, class_transformer_1.plainToInstance)(create_sns_dto_1.CreateSnsDto, req.body);
                const errors = yield (0, class_validator_1.validate)(createSnsDto);
                if (errors.length > 0) {
                    const message = errors
                        .map((error) => Object.values(error.constraints || {}))
                        .join(", ");
                    throw new AppError_1.AppError(message, 400, "BadRequest");
                }
                const newSns = yield this.memberService.createSns(userId, createSnsDto);
                res.status(200).json({
                    message: "SNS가 성공적으로 작성되었습니다.",
                    sns_id: newSns.sns_id,
                    url: newSns.url,
                    description: newSns.description,
                    created_at: newSns.created_at,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateSns(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user_id;
                const snsId = parseInt(req.params.snsId, 10);
                const updateSnsDto = (0, class_transformer_1.plainToInstance)(update_sns_dto_1.UpdateSnsDto, req.body);
                const errors = yield (0, class_validator_1.validate)(updateSnsDto);
                if (errors.length > 0) {
                    const message = errors
                        .map((error) => Object.values(error.constraints || {}))
                        .join(", ");
                    throw new AppError_1.AppError(message, 400, "BadRequest");
                }
                const updatedSns = yield this.memberService.updateSns(userId, snsId, updateSnsDto);
                res.status(200).json({
                    message: "SNS가 성공적으로 수정되었습니다.",
                    sns_id: updatedSns.sns_id,
                    url: updatedSns.url,
                    description: updatedSns.description,
                    updated_at: updatedSns.updated_at,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteSns(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user_id;
                const snsId = parseInt(req.params.snsId, 10);
                yield this.memberService.deleteSns(userId, snsId);
                res.status(200).json({
                    message: "SNS 정보가 삭제되었습니다.",
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSnsList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const memberId = parseInt(req.params.memberId, 10);
                const snsList = yield this.memberService.getSnsList(memberId);
                res.status(200).json({
                    message: "SNS 목록 조회 완료",
                    data: snsList,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    uploadProfileImage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user_id;
                if (!req.file) {
                    throw new AppError_1.AppError("이미지 파일이 필요합니다.", 400, "BadRequest");
                }
                const imageUrl = req.file.path;
                yield this.memberService.uploadProfileImage(userId, imageUrl);
                res.status(200).json({
                    message: "프로필 이미지 등록 완료",
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    followMember(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const followerId = req.user.user_id;
                const followingId = parseInt(req.params.memberId, 10);
                const follow = yield this.memberService.followMember(followerId, followingId);
                res.status(200).json({
                    message: "팔로우가 완료되었습니다.",
                    data: follow,
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    unfollowMember(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const followerId = req.user.user_id;
                const followingId = parseInt(req.params.memberId, 10);
                yield this.memberService.unfollowMember(followerId, followingId);
                res.status(200).json({
                    message: "언팔로우가 완료되었습니다.",
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    withdrawMember(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user_id;
                yield this.memberService.withdrawMember(userId);
                res.status(200).json({
                    message: "회원 탈퇴가 완료되었습니다.",
                    statusCode: 200,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.MemberController = MemberController;
