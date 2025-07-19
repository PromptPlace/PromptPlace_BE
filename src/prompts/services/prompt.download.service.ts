import { PromptDownloadRepository } from '../repositories/prompt.download.repository';
import { PromptDownloadResponseDTO } from '../dtos/prompt.download.dto';

export const PromptDownloadService = {
  async getPromptContent(userId: number, promptId: number): Promise<PromptDownloadResponseDTO> {
    const prompt = await PromptDownloadRepository.findById(promptId);

    if (!prompt) {
      throw {
        statusCode: 404,
        error: 'NotFound',
        message: '해당 프롬프트를 찾을 수 없습니다.',
      };
    }

    return {
      message: '프롬프트 무료 다운로드 완료',
      title: prompt.title,
      prompt: prompt.prompt,
      is_free: prompt.is_free,
      statusCode: 200,
    };
  }
};