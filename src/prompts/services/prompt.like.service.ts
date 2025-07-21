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

    return likes.map((like) => ({
      prompt_id: like.prompt.prompt_id,
      title: like.prompt.title,
      description: like.prompt.description,
      is_free: like.prompt.is_free,
      download_url: like.prompt.download_url,
      liked_at: like.created_at,
    }));
  }
};