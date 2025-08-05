import { PromptDownloadRepository } from '../repositories/prompt.download.repository';
import { PromptDownloadResponseDTO } from '../dtos/prompt.download.dto';
import { AppError } from '../../errors/AppError';
import prisma from "../../config/prisma";

export const PromptDownloadService = {
  async getPromptContent(userId: number, promptId: number): Promise<PromptDownloadResponseDTO> {
    const prompt = await PromptDownloadRepository.findById(promptId);

    if (!prompt) {
      throw new AppError('해당 프롬프트를 찾을 수 없습니다.', 404, 'NotFound');
    }

    let isPaid = false;

     // 유료 프롬프트인 경우 결제 여부 확인
    if (!prompt.is_free) {
      const purchase = await prisma.purchase.findFirst({
        where: {
          user_id: userId,
          prompt_id: promptId,
        },
        include: {
          payment: true,
        },
      });

      isPaid = purchase?.payment?.status === 'Succeed';

      if (!isPaid) {
        throw new AppError('해당 프롬프트는 무료가 아니며, 결제가 완료되지 않았습니다.', 403, 'Forbidden');
      }
    }

    return {
      message: '프롬프트 무료 다운로드 완료',
      title: prompt.title,
      prompt: prompt.prompt,
      is_free: prompt.is_free,
      is_paid: prompt.is_free ? true : isPaid,
      statusCode: 200,
    };
  }
};