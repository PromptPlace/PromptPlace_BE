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
exports.getMyReceivedReviews = exports.getReviewsWrittenByMe = exports.editReview = exports.getReviewEditData = exports.deleteReview = exports.postReview = exports.getReviewsByPromptId = void 0;
const review_service_1 = require("../services/review.service");
const getReviewsByPromptId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: 'no user',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    try {
        const result = yield (0, review_service_1.findReviewsByPromptId)(req.params.promptId, req.query.cursor, req.query.limit);
        res.success(Object.assign({}, result));
    }
    catch (err) {
        console.error(err);
        res.fail({
            error: err.name || 'InternalServerError',
            message: err.message || '리뷰 목록 조회 중 오류가 발생했습니다.',
            statusCode: err.statusCode || 500
        });
    }
});
exports.getReviewsByPromptId = getReviewsByPromptId;
const postReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('req.user:', req.user);
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: 'no user',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    try {
        const userId = req.user.user_id;
        const promptId = (_a = (req.params.promptId)) === null || _a === void 0 ? void 0 : _a.toString();
        const { rating, content } = req.body;
        if (!promptId) {
            res.status(400).json({ message: 'promptId가 없습니다.' });
            return;
        }
        const result = yield (0, review_service_1.createReviewService)(promptId, userId, rating, content);
        res.success(Object.assign({}, result));
    }
    catch (err) {
        console.error(err);
        res.fail({
            error: err.name || 'InternalServerError',
            message: err.message || '리뷰 작성 중 오류가 발생했습니다.',
            statusCode: err.statusCode || 500,
        });
    }
});
exports.postReview = postReview;
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: 'no user',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    try {
        const userId = req.user.user_id;
        const reviewId = req.params.reviewId;
        if (!reviewId) {
            res.status(400).json({ message: '리뷰 ID가 없습니다.' });
            return;
        }
        yield (0, review_service_1.deleteReviewService)(reviewId, userId);
        res.success({
            message: '리뷰가 성공적으로 삭제되었습니다.',
        });
    }
    catch (err) {
        console.error(err);
        res.fail({
            error: err.name || 'InternalServerError',
            message: err.message || '리뷰 삭제 중 오류가 발생했습니다.',
            statusCode: err.statusCode || 500,
        });
    }
});
exports.deleteReview = deleteReview;
// 리뷰 수정 화면
const getReviewEditData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: 'no user',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    try {
        const reviewId = req.params.reviewId;
        if (!reviewId) {
            res.status(400).json({ message: '리뷰 ID가 없습니다.' });
            return;
        }
        const review = yield (0, review_service_1.getReviewEditDataService)(reviewId, req.user.user_id);
        res.success(Object.assign({}, review));
    }
    catch (err) {
        console.error(err);
        res.fail({
            error: err.name || 'InternalServerError',
            message: err.message || '리뷰 수정 화면을 불러오는 중 오류가 발생했습니다.',
            statusCode: err.statusCode || 500,
        });
    }
});
exports.getReviewEditData = getReviewEditData;
// 리뷰 수정 
const editReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: 'no user',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    try {
        const userId = req.user.user_id;
        const reviewId = req.params.reviewId;
        const { rating, content } = req.body;
        if (!reviewId) {
            res.status(400).json({ message: '리뷰 ID가 없습니다.' });
            return;
        }
        if (rating == null || content == null) {
            res.status(400).json({ message: 'rating 또는 content가 누락되었습니다.' });
            return;
        }
        const updatedReview = yield (0, review_service_1.editReviewService)(reviewId, userId, rating, content);
        res.success({
            message: '리뷰가 성공적으로 수정되었습니다.',
            review: updatedReview,
        });
    }
    catch (err) {
        console.error(err);
        res.fail({
            error: err.name || 'InternalServerError',
            message: err.message || '리뷰 수정 중 오류가 발생했습니다.',
            statusCode: err.statusCode || 500,
        });
    }
});
exports.editReview = editReview;
// 내가 작성한 리뷰 목록 조회
const getReviewsWrittenByMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: 'no user',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    try {
        const userId = req.user.user_id;
        const { cursor, limit } = req.query;
        const reviews = yield (0, review_service_1.findReviewsWrittenByUser)(userId, cursor, limit);
        res.success(Object.assign({ statusCode: 200, message: '내가 작성한 리뷰 목록을 성공적으로 불러왔습니다.' }, reviews));
    }
    catch (err) {
        console.error(err);
        res.fail({
            error: err.name || 'InternalServerError',
            message: err.message || '내가 작성한 리뷰 목록을 불러오는 중 오류가 발생했습니다.',
            statusCode: err.statusCode || 500,
        });
    }
});
exports.getReviewsWrittenByMe = getReviewsWrittenByMe;
// 내가 받은 리뷰 목록 조회
const getMyReceivedReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: 'no user',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    try {
        const userId = req.user.user_id;
        const { cursor, limit } = req.query;
        const reviews = yield (0, review_service_1.findMyReceivedReviews)(userId, cursor, limit);
        res.success(Object.assign({ statusCode: 200, message: '내가 받은 리뷰 목록을 성공적으로 불러왔습니다.' }, reviews));
    }
    catch (err) {
        console.error(err);
        res.fail({
            error: err.name || 'InternalServerError',
            message: err.message || '내가 작성한 리뷰 목록을 불러오는 중 오류가 발생했습니다.',
            statusCode: err.statusCode || 500,
        });
    }
});
exports.getMyReceivedReviews = getMyReceivedReviews;
