import { PromptDownloadRepository } from '../repositories/prompt.download.repository';
import { PromptDownloadResponseDTO, DownloadedPromptResponseDTO } from '../dtos/prompt.download.dto';
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

    // ✅ 다운로드 카운트 증가
    await PromptDownloadRepository.increaseDownload(promptId);

    return {
      message: '프롬프트 무료 다운로드 완료',
      title: prompt.title,
      prompt: prompt.prompt,
      is_free: prompt.is_free,
      is_paid: prompt.is_free ? true : isPaid,
      statusCode: 200,
    };
  },

  async getDownloadedPrompts(userId: number): Promise<DownloadedPromptResponseDTO[]> {
    const downloads = await PromptDownloadRepository.getDownloadedPromptsByUser(userId);

    const THIRTY_DAYS_AGO = new Date();
    THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);

    return downloads.map(({ prompt }) => {
      const review = prompt.reviews[0]; // 사용자는 프롬프트당 리뷰 하나만 작성 가능하다고 가정
      const hasReview = !!review;
      const isRecentReview = hasReview && new Date(review.created_at) >= THIRTY_DAYS_AGO;

      return {
        message: "다운로드한 프롬프트 목록 조회 성공",
        prompt_id: prompt.prompt_id,
        title: prompt.title,
        models: prompt.models.map((m) => m.model.name),
        has_review: hasReview,
        is_recent_review: isRecentReview,
        statusCode: 200,
      };
    });
  }
};