import { Request, Response } from 'express';
import { PromptLikeService } from '../services/prompt.like.service';

export const likePrompt = async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) {
    res.fail({
      statusCode: 401,
      error: 'Unauthorized',
      message: '로그인이 필요합니다.',
    });
    return;
  }

  const userId = (req.user as { user_id: number }).user_id;
  const promptId = parseInt(req.params.promptId, 10);

  try {
    await PromptLikeService.likePrompt(userId, promptId);
    res.status(201).json({
      message: '프롬프트 찜 성공',
      statusCode: 201,
    });
  } catch (err: any) {
    res.fail({
      statusCode: err.statusCode || 500,
      error: err.error || 'InternalServerError',
      message: err.message || '알 수 없는 오류가 발생했습니다.',
    });
  }
};

export const getLikedPrompts = async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) {
    res.fail({
      statusCode: 401,
      error: 'Unauthorized',
      message: '로그인이 필요합니다.',
    });
    return;
  }

  const userId = (req.user as { user_id: number }).user_id;

  try {
    const result = await PromptLikeService.getLikedPrompts(userId);
    res.success(result, '찜한 프롬프트 목록 조회 성공');
  } catch (err: any) {
    res.fail({
      statusCode: err.statusCode || 500,
      error: err.error || 'InternalServerError',
      message: err.message || '알 수 없는 오류가 발생했습니다.',
    });
  }
};

export const unlikePrompt = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.fail({
      statusCode: 401,
      error: 'Unauthorized',
      message: '로그인이 필요합니다.',
    });
    return;
  }

  const userId = (req.user as { user_id: number }).user_id;
  const promptId = Number(req.params.promptId);

  try {
    await PromptLikeService.unlikePrompt(userId, promptId);
    res.success(null, '프롬프트 찜 취소 성공');
  } catch (err: any) {
    res.fail({
      statusCode: err.statusCode || 500,
      error: err.error || 'InternalServerError',
      message: err.message || '서버 오류가 발생했습니다.',
    });
  }
};