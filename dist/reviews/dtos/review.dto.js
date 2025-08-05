"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToMyReceivedReviewListDTO = exports.mapToMyReviewListDTO = exports.mapToReviewUpdateResponse = exports.mapToReviewEditDataDTO = exports.mapToReviewResponse = exports.mapToReviewListDTO = void 0;
// 리뷰 List 반환 DTO
const mapToReviewListDTO = (rawReviews, rawProfiles, limit) => {
    const userMap = new Map(rawProfiles.map(user => {
        var _a;
        return [
            user.user_id,
            {
                nickname: user.nickname,
                imageUrl: ((_a = user.profileImage) === null || _a === void 0 ? void 0 : _a.url) || null
            }
        ];
    }));
    const reviews = rawReviews.map((review) => {
        const userInfo = userMap.get(review.user_id);
        return {
            review_id: review.review_id,
            writer_id: review.user_id,
            writer_nickname: (userInfo === null || userInfo === void 0 ? void 0 : userInfo.nickname) || 'Unknown',
            writer_image_url: (userInfo === null || userInfo === void 0 ? void 0 : userInfo.imageUrl) || null,
            rating: review.rating,
            content: review.content,
            created_at: review.created_at.toISOString()
        };
    });
    return {
        has_more: rawReviews.length >= limit,
        reviews
    };
};
exports.mapToReviewListDTO = mapToReviewListDTO;
// 단일 리뷰 정보 반환 DTO
const mapToReviewResponse = (review) => ({
    review_id: review.review_id,
    writer_id: review.user_id,
    prompt_id: review.prompt_id,
    rating: review.rating,
    content: review.content,
    createdAt: review.created_at
});
exports.mapToReviewResponse = mapToReviewResponse;
// 리뷰 수정 화면 데이터 반환 dto
const mapToReviewEditDataDTO = ({ review, prompt, modelId, modelName, prompterId, prompterNickname }) => {
    return {
        prompter_id: prompterId,
        prompter_nickname: prompterNickname,
        prompt_id: prompt.prompt_id,
        prompt_title: prompt.title,
        model_id: modelId,
        model_name: modelName,
        rating_avg: prompt.rating_avg.toFixed(1), // 소수점 첫째 자리까지(string)
        content: review.content,
    };
};
exports.mapToReviewEditDataDTO = mapToReviewEditDataDTO;
const mapToReviewUpdateResponse = (review, writerName) => ({
    review_id: review.review_id,
    prompt_id: review.prompt_id,
    writer_name: writerName,
    rating: review.rating,
    content: review.content,
    updated_at: review.updated_at.toISOString()
});
exports.mapToReviewUpdateResponse = mapToReviewUpdateResponse;
// 내가 작성한 리뷰 리스트 반환 DTO
const mapToMyReviewListDTO = (rawReviews, limit) => {
    const reviews = rawReviews.map(review => ({
        review_id: review.review_id,
        prompt_id: review.prompt.prompt_id,
        prompt_title: review.prompt.title,
        rating: review.rating,
        content: review.content,
        created_at: review.created_at.toISOString(),
        updated_at: review.updated_at.toISOString(),
    }));
    return {
        reviews,
        has_more: rawReviews.length >= limit
    };
};
exports.mapToMyReviewListDTO = mapToMyReviewListDTO;
const mapToMyReceivedReviewListDTO = (rawReviews, userProfiles, limit) => {
    const userMap = new Map(userProfiles.map(user => {
        var _a;
        return [
            user.user_id,
            {
                nickname: user.nickname,
                imageUrl: ((_a = user.profileImage) === null || _a === void 0 ? void 0 : _a.url) || null
            }
        ];
    }));
    const reviews = rawReviews.map((review) => {
        const writer = userMap.get(review.user_id);
        return {
            review_id: review.review_id,
            prompt_id: review.prompt.prompt_id,
            prompt_title: review.prompt.title,
            writer_id: review.user_id,
            writer_nickname: (writer === null || writer === void 0 ? void 0 : writer.nickname) || 'Unknown',
            writer_profile_image_url: (writer === null || writer === void 0 ? void 0 : writer.imageUrl) || null,
            rating: review.rating,
            content: review.content,
            created_at: review.created_at.toISOString(),
            updated_at: review.updated_at.toISOString(),
        };
    });
    return {
        reviews,
        has_more: rawReviews.length >= limit,
    };
};
exports.mapToMyReceivedReviewListDTO = mapToMyReceivedReviewListDTO;
