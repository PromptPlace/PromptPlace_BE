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
exports.findMyReceivedReviews = exports.findReviewsWrittenByUser = exports.editReviewService = exports.getReviewEditDataService = exports.deleteReviewService = exports.createReviewService = exports.findReviewsByPromptId = void 0;
const review_dto_1 = require("../dtos/review.dto");
const review_repository_1 = require("../repositories/review.repository");
const findReviewsByPromptId = (rawPromptId, rawCursor, rawLimit) => __awaiter(void 0, void 0, void 0, function* () {
    const promptId = parseInt(rawPromptId, 10);
    const cursor = rawCursor ? parseInt(rawCursor, 10) : undefined;
    const limit = rawLimit ? parseInt(rawLimit, 10) : 10;
    if (isNaN(promptId))
        throw new Error('promptId값이 적절하지 않습니다');
    if (cursor !== undefined && isNaN(cursor))
        throw new Error('cursor값이 적절하지 않습니다');
    if (isNaN(limit))
        throw new Error('limit값이 적절하지 않습니다');
    // 리뷰 불러오기
    const rawReviews = yield (0, review_repository_1.findAllByPromptId)(promptId, cursor, limit);
    // 리뷰 작성자 user_id 리스트
    const userIds = rawReviews.map(review => review.user_id);
    // 사용자 프로필 정보 가져오기 (nickname + image_url)
    const userProfiles = yield (0, review_repository_1.findUserProfilesByUserIds)(userIds);
    // DTO로 변환
    return (0, review_dto_1.mapToReviewListDTO)(rawReviews, userProfiles, limit);
});
exports.findReviewsByPromptId = findReviewsByPromptId;
const createReviewService = (promptId, userId, rating, content) => __awaiter(void 0, void 0, void 0, function* () {
    if (!promptId || isNaN(Number(promptId))) {
        throw new Error('유효하지 않은 promptId입니다.');
    }
    const newReview = yield (0, review_repository_1.createReview)({
        promptId: Number(promptId),
        userId,
        rating,
        content
    });
    return (0, review_dto_1.mapToReviewResponse)(newReview);
});
exports.createReviewService = createReviewService;
// 리뷰 삭제
const deleteReviewService = (reviewId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!reviewId || isNaN(Number(reviewId))) {
        throw {
            name: 'BadRequest',
            message: '유효하지 않은 reviewId입니다.',
            statusCode: 400
        };
    }
    const numericReviewId = Number(reviewId);
    const review = yield (0, review_repository_1.findReviewById)(numericReviewId);
    if (!review) {
        throw {
            name: 'NotFound',
            message: '해당 리뷰를 찾을 수 없습니다.',
            statusCode: 404
        };
    }
    const user = yield (0, review_repository_1.findUserById)(userId);
    if (!user) {
        throw {
            name: 'NotFound',
            message: '해당 사용자를 찾을 수 없습니다.',
            statusCode: 404
        };
    }
    const isAdmin = user.role === 'ADMIN'; // 관리자 여부 확인
    // 일반 사용자일 경우 
    if (!isAdmin) {
        if (review.user_id !== userId) {
            throw {
                name: 'Forbidden',
                message: '리뷰를 삭제할 권한이 없습니다.',
                statusCode: 403,
            };
        }
        const now = new Date();
        const createdAt = new Date(review.created_at);
        const diffInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (diffInDays > 30) {
            throw {
                name: 'Forbidden',
                message: '리뷰 작성일로부터 30일이 지나 삭제할 수 없습니다.',
                statusCode: 403,
            };
        }
    }
    // 관리자일 경우 바로 삭제
    yield (0, review_repository_1.deleteReviewById)(numericReviewId);
});
exports.deleteReviewService = deleteReviewService;
// 리뷰 수정 화면
const getReviewEditDataService = (reviewId, currentUserId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!reviewId || isNaN(Number(reviewId))) {
        throw new Error('유효하지 않은 reviewId입니다.');
    }
    const numericReviewId = Number(reviewId);
    const review = yield (0, review_repository_1.findReviewById)(numericReviewId);
    if (!review) {
        throw new Error('해당 리뷰를 찾을 수 없습니다.');
    }
    // 작성자 확인 (토큰 유저 vs 리뷰 작성자)
    if (review.user_id !== currentUserId) {
        const error = new Error('해당 리뷰에 대한 수정 권한이 없습니다.');
        error.statusCode = 403;
        error.name = 'Forbidden';
        throw error;
    }
    const prompt = yield (0, review_repository_1.findPromptById)(review.prompt_id);
    if (!prompt) {
        throw new Error('해당 리뷰에 대한 프롬프트를 찾을 수 없습니다.');
    }
    const prompterNickname = yield (0, review_repository_1.findNicknameByUserId)(prompt.user_id);
    if (!prompterNickname)
        throw new Error('작성자의 닉네임을 찾을 수 없습니다.');
    const model = yield (0, review_repository_1.findModelByPromptId)(prompt.prompt_id);
    if (!model) {
        throw new Error('프롬프트에 연결된 모델을 찾을 수 없습니다.');
    }
    return (0, review_dto_1.mapToReviewEditDataDTO)({
        review,
        prompt,
        modelId: model.model_id,
        modelName: model.model_name,
        prompterId: prompt.user_id,
        prompterNickname
    });
});
exports.getReviewEditDataService = getReviewEditDataService;
// 리뷰 수정
const editReviewService = (reviewId, userId, rating, content) => __awaiter(void 0, void 0, void 0, function* () {
    if (!reviewId || isNaN(Number(reviewId))) {
        throw {
            name: 'BadRequest',
            message: '유효하지 않은 reviewId입니다.',
            statusCode: 400
        };
    }
    const numericReviewId = Number(reviewId);
    const review = yield (0, review_repository_1.findReviewById)(numericReviewId);
    if (!review) {
        throw {
            name: 'NotFound',
            message: '해당 리뷰를 찾을 수 없습니다.',
            statusCode: 404
        };
    }
    if (review.user_id !== userId) {
        throw {
            name: 'Forbidden',
            message: '리뷰를 수정할 권한이 없습니다.',
            statusCode: 403
        };
    }
    const now = new Date();
    const createdAt = new Date(review.created_at);
    const diffInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (diffInDays > 30) {
        throw {
            name: 'Forbidden',
            message: '리뷰 작성일로부터 30일이 지나 수정할 수 없습니다.',
            statusCode: 403
        };
    }
    const updated = yield (0, review_repository_1.updateReviewById)(numericReviewId, {
        rating,
        content
    });
    const writerName = yield (0, review_repository_1.findNicknameByUserId)(userId);
    return (0, review_dto_1.mapToReviewUpdateResponse)(updated, writerName || '알 수 없음');
});
exports.editReviewService = editReviewService;
// 내가 작성한 리뷰 목록 조회 
const findReviewsWrittenByUser = (userId, rawCursor, rawLimit) => __awaiter(void 0, void 0, void 0, function* () {
    const cursor = rawCursor ? parseInt(rawCursor, 10) : undefined;
    const limit = rawLimit ? parseInt(rawLimit, 10) : 10;
    if (cursor !== undefined && isNaN(cursor))
        throw new Error('cursor값이 적절하지 않습니다');
    if (isNaN(limit))
        throw new Error('limit값이 적절하지 않습니다');
    const rawReviews = yield (0, review_repository_1.findAllReviewsByUserId)(userId, cursor, limit);
    return (0, review_dto_1.mapToMyReviewListDTO)(rawReviews, limit);
});
exports.findReviewsWrittenByUser = findReviewsWrittenByUser;
// 내가 받은 리뷰 목록 조회
const findMyReceivedReviews = (userId, rawCursor, rawLimit) => __awaiter(void 0, void 0, void 0, function* () {
    const cursor = rawCursor ? parseInt(rawCursor, 10) : undefined;
    const limit = rawLimit ? parseInt(rawLimit, 10) : 10;
    if (cursor !== undefined && isNaN(cursor))
        throw new Error('cursor값이 적절하지 않습니다');
    if (isNaN(limit))
        throw new Error('limit값이 적절하지 않습니다');
    const rawReviews = yield (0, review_repository_1.findAllMyReviewsByUserId)(userId, cursor, limit);
    const writerIds = rawReviews.map(review => review.user_id);
    const userProfiles = yield (0, review_repository_1.findUserProfilesByUserIds)(writerIds);
    return (0, review_dto_1.mapToMyReceivedReviewListDTO)(rawReviews, userProfiles, limit);
});
exports.findMyReceivedReviews = findMyReceivedReviews;
