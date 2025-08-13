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
exports.findUserById = exports.findAllMyReviewsByUserId = exports.findAllReviewsByUserId = exports.updateReviewById = exports.findModelByPromptId = exports.findNicknameByUserId = exports.findPromptById = exports.deleteReviewById = exports.findReviewById = exports.createReview = exports.findUserProfilesByUserIds = exports.findAllByPromptId = exports.createReviewInDB = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createReviewInDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.review.create({
        data: {
            prompt_id: data.promptId,
            user_id: data.userId,
            rating: data.rating,
            content: data.content
        }
    });
});
exports.createReviewInDB = createReviewInDB;
const findAllByPromptId = (promptId, cursor, limit) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.review.findMany({
        where: Object.assign({ prompt_id: promptId }, (cursor && { review_id: { lt: cursor } })),
        orderBy: {
            review_id: 'desc'
        },
        take: limit
    });
});
exports.findAllByPromptId = findAllByPromptId;
// 리뷰 작성자들의 닉네임 + 프로필 이미지 URL 조회
const findUserProfilesByUserIds = (userIds) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.user.findMany({
        where: {
            user_id: { in: userIds }
        },
        select: {
            user_id: true,
            nickname: true,
            profileImage: {
                select: {
                    url: true
                }
            }
        }
    });
});
exports.findUserProfilesByUserIds = findUserProfilesByUserIds;
const createReview = (_a) => __awaiter(void 0, [_a], void 0, function* ({ promptId, userId, rating, content }) {
    return yield prisma.review.create({
        data: {
            prompt_id: promptId,
            user_id: userId,
            rating,
            content
        }
    });
});
exports.createReview = createReview;
const findReviewById = (reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.review.findUnique({
        where: {
            review_id: reviewId
        }
    });
});
exports.findReviewById = findReviewById;
const deleteReviewById = (reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.review.delete({
        where: {
            review_id: reviewId
        }
    });
});
exports.deleteReviewById = deleteReviewById;
const findPromptById = (promptId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.prompt.findUnique({
        where: {
            prompt_id: promptId
        }
    });
});
exports.findPromptById = findPromptById;
// 사용자 ID로 닉네임만 조회
const findNicknameByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
        where: {
            user_id: userId
        },
        select: {
            nickname: true
        }
    });
    return (user === null || user === void 0 ? void 0 : user.nickname) || null;
});
exports.findNicknameByUserId = findNicknameByUserId;
// 프롬프트 ID로 모델 조회
const findModelByPromptId = (promptId) => __awaiter(void 0, void 0, void 0, function* () {
    const promptModel = yield prisma.promptModel.findFirst({
        where: { prompt_id: promptId },
        include: {
            model: {
                select: {
                    model_id: true,
                    name: true
                }
            }
        }
    });
    if (!(promptModel === null || promptModel === void 0 ? void 0 : promptModel.model))
        return null;
    return {
        model_id: promptModel.model.model_id,
        model_name: promptModel.model.name
    };
});
exports.findModelByPromptId = findModelByPromptId;
// 리뷰 수정
const updateReviewById = (reviewId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.review.update({
        where: {
            review_id: reviewId
        },
        data: Object.assign(Object.assign({}, (data.rating !== undefined && { rating: data.rating })), (data.content !== undefined && { content: data.content }) // content 필드가 undefined가 아닐 때만 업데이트
        )
    });
});
exports.updateReviewById = updateReviewById;
// 내가 작성한 리뷰 조회 
const findAllReviewsByUserId = (userId, cursor, limit) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.review.findMany({
        where: Object.assign({ user_id: userId }, (cursor && { review_id: { lt: cursor } })),
        orderBy: {
            review_id: 'desc',
        },
        take: limit,
        include: {
            prompt: {
                select: {
                    prompt_id: true,
                    title: true,
                },
            },
        },
    });
});
exports.findAllReviewsByUserId = findAllReviewsByUserId;
// 내가 받은 리뷰 조회
const findAllMyReviewsByUserId = (userId, cursor, limit) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.review.findMany({
        where: Object.assign({ prompt: {
                user_id: userId,
            } }, (cursor && { review_id: { lt: cursor } })),
        include: {
            prompt: {
                select: {
                    prompt_id: true,
                    title: true
                }
            }
        },
        take: limit,
        orderBy: {
            review_id: 'desc',
        }
    });
});
exports.findAllMyReviewsByUserId = findAllMyReviewsByUserId;
// 사용자 ID로 사용자 정보 조회
const findUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.user.findUnique({
        where: {
            user_id: userId
        }
    });
});
exports.findUserById = findUserById;
