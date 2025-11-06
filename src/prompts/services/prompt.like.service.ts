import * as promptLikeRepo from '../repositories/prompt.like.repository';
import { GetLikedPromptsResponse, LikedPrompt } from '../dtos/prompt.like.dto';
import { AppError } from '../../errors/AppError';

export const PromptLikeService = {
  async likePrompt(userId: number, promptId: number): Promise<void> {
    const prompt = await promptLikeRepo.findPromptById(promptId);
    if (!prompt) {
      throw new AppError('해당 프롬프트를 찾을 수 없습니다.', 404, 'NotFound');
    }

    const alreadyLiked = await promptLikeRepo.hasLikedPrompt(userId, promptId);
    if (alreadyLiked) {
      throw new AppError('이미 찜한 프롬프트입니다.', 409, 'Conflict');
    }

    await promptLikeRepo.addPromptLike(userId, promptId);
  },

 async getLikedPrompts(userId: number): Promise<GetLikedPromptsResponse> {
    const likes = await promptLikeRepo.getLikedPromptsByUser(userId);

    const likedPromptsData: LikedPrompt[] = likes
        .map((like) => {
            const prompt = like.prompt as any; 
            if (!prompt) return null; 

            const review_count = prompt._count.reviews; 
            
            let review_rating_avg = 0.0;
            if (review_count > 0) {
                // 가져온 리뷰 배열에서 rating 값만 추출하여 합산
                const totalRating = prompt.reviews.reduce(
                    (sum: number, review: { rating: number }) => sum + review.rating,
                    0
                );
                // 평균 계산 및 소수점 첫째 자리로 제한
                review_rating_avg = parseFloat((totalRating / review_count).toFixed(1));
            }

            return {
                prompt_id: prompt.prompt_id,
                user_id: prompt.user_id,
                title: prompt.title,
                prompt: prompt.prompt,
                prompt_result: prompt.prompt_result,
                has_image: prompt.has_image,
                description: prompt.description,
                usage_guide: prompt.usage_guide,
                price: prompt.price,
                is_free: prompt.is_free,
                downloads: prompt.downloads,
                views: prompt.views,
                likes: prompt.likes,
                model_version: prompt.model_version,
                created_at: prompt.created_at,
                updated_at: prompt.updated_at,
                inactive_date: prompt.inactive_date,
                
                user: prompt.user,
                models: prompt.models,
                categories: prompt.categories, 
                images: prompt.images,
                
                review_count: review_count, 
                review_rating_avg: review_rating_avg,
            };
        })
        .filter((p): p is LikedPrompt => p !== null);

    return {
        message: "좋아요 누른 프롬프트 목록 조회 성공",
        statusCode: 200,
        data: likedPromptsData,
    };
},

   async unlikePrompt(userId: number, promptId: number): Promise<void> {
    const existing = await promptLikeRepo.hasLikedPrompt(userId, promptId);
    if (!existing) {
      throw new AppError('찜하지 않은 프롬프트입니다.', 404, 'NotFound');
    }

    await promptLikeRepo.removePromptLike(userId, promptId);
  },
};