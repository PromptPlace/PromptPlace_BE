import * as promptLikeRepo from '../repositories/prompt.like.repository';
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

 async getLikedPrompts(userId: number) {
    const likes = await promptLikeRepo.getLikedPromptsByUser(userId);

    return likes.map((like) => {
      const prompt = like.prompt;

      return {
        prompt_id: prompt.prompt_id,
        title: prompt.title,
        models: prompt.models.map((m) => m.model.name),
        tags: prompt.tags.map((t) => t.tag.name),
      };
    });
  },

   async unlikePrompt(userId: number, promptId: number): Promise<void> {
    const existing = await promptLikeRepo.hasLikedPrompt(userId, promptId);
    if (!existing) {
      throw new AppError('찜하지 않은 프롬프트입니다.', 404, 'NotFound');
    }

    await promptLikeRepo.removePromptLike(userId, promptId);
  },
};