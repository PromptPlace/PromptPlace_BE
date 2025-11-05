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
    const likedPromptsData: LikedPrompt[] = likes.map((like) => {
      const prompt = like.prompt;
      if (!prompt) return null;

      const imageUrls = prompt.images.map(img => img.image_url);

      return {
        prompt_id: prompt.prompt_id,
        title: prompt.title,
        nickname: prompt.user.nickname,
        price: prompt.price,
        models: prompt.models.map((m: any) => m.model.name),
        promptContent: prompt.prompt,
        imageUrls: imageUrls,
        views: prompt.views,
        downloads: prompt.downloads,
        created_at: prompt.created_at,
      };
    }).filter((p): p is LikedPrompt => p !== null);
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