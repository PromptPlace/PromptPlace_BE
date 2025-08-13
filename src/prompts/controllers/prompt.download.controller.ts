import { Request, Response } from 'express';
import { PromptDownloadService } from '../services/prompt.download.service';

export const PromptDownloadController = {
  async getPromptContent(req: Request, res: Response): Promise<void> {
    // 사용자 인증 확인
    if (!req.user) {
       res.status(401).json({
        error: 'Unauthorized',
        message: '로그인이 필요합니다.',
        statusCode: 401,
      });
      return;
    }

    const userId = (req.user as { user_id: number }).user_id;
    const promptId = Number(req.params.promptId);

    try {
      const result = await PromptDownloadService.getPromptContent(userId, promptId);
      res.status(200).json(result);
    } catch (err: any) {
      const status = err.statusCode || 500;
        res.status(status).json({
        error: err.error || 'InternalServerError',
        message: err.message || '서버 오류가 발생했습니다.',
        statusCode: status,
      });
      return;
    }
  },

  async getDownloadedPrompts(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: '로그인이 필요합니다.',
        statusCode: 401,
      });
      return;
    }

    const userId = (req.user as { user_id: number }).user_id;

    try {
      const result = await PromptDownloadService.getDownloadedPrompts(userId);
      res.status(200).json({
        message: '프롬프트 다운로드 목록 조회 성공',
        statusCode: 200,
        data: result,
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({
        error: err.error || 'InternalServerError',
        message: err.message || '서버 오류가 발생했습니다.',
        statusCode: err.statusCode || 500,
      });
    }
  }
};