import { Request, Response, NextFunction } from 'express';
import * as promptLikeRepo from '../repositories/prompt.like.repository';

export const likePrompt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 인증 여부 검사
    if (!req.user) {
        res.status(401).json({
        error: 'Unauthorized',
        message: '로그인이 필요합니다.',
        statusCode: 401,
      });
    }

    // 타입 단언 후 user_id 추출
    const userId = (req.user as { user_id: number }).user_id;
    const promptId = parseInt(req.params.promptId, 10);

    // 프롬프트 존재 여부 확인
    const prompt = await promptLikeRepo.findPromptById(promptId);
    if (!prompt) {
        res.status(404).json({
        error: 'NotFound',
        message: '해당 프롬프트를 찾을 수 없습니다.',
        statusCode: 404,
      });
    }

    // 이미 찜했는지 확인
    const alreadyLiked = await promptLikeRepo.hasLikedPrompt(userId, promptId);
    if (alreadyLiked) {
        res.status(409).json({
        error: 'Conflict',
        message: '이미 찜한 프롬프트입니다.',
        statusCode: 409,
      });
    }

    // 찜 등록
    await promptLikeRepo.addPromptLike(userId, promptId);

    res.status(201).json({
      message: '프롬프트 찜 성공',
      statusCode: 201,
    });
  } catch (error) {
    console.error('likePrompt error:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: '알 수 없는 오류가 발생했습니다.',
      statusCode: 500,
    });
  }
};

export const getLikedPrompts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
        res.status(401).json({
        error: 'Unauthorized',
        message: '로그인이 필요합니다.',
        statusCode: 401,
      });
    }

    const userId = (req.user as { user_id: number }).user_id;

    const likes = await promptLikeRepo.getLikedPromptsByUser(userId);

    const result = likes.map((like) => ({
      prompt_id: like.prompt.prompt_id,
      title: like.prompt.title,
      description: like.prompt.description,
      is_free: like.prompt.is_free,
      download_url: like.prompt.download_url,
      liked_at: like.created_at,
    }));

    res.status(200).json({
      message: '찜한 프롬프트 목록 조회 성공',
      data: result,
      statusCode: 200,
    });
  } catch (error) {
    console.error('getLikedPrompts error:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: '알 수 없는 오류가 발생했습니다.',
      statusCode: 500,
    });
  }
};