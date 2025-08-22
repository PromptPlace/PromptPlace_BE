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

  if (!prompt.is_free) {
    // 유료 프롬프트일 경우 결제 상태 확인
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
  } else {
    // 무료 프롬프트일 경우 purchase 기록이 없다면 추가
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        user_id: userId,
        prompt_id: promptId,
      },
    });

    if (!existingPurchase) {
      await prisma.purchase.create({
        data: {
          user_id: userId,
          prompt_id: promptId,
           amount: 0,
          is_free: true,
        },
      });
    }
  }

  await PromptDownloadRepository.increaseDownload(promptId);

  return {
    message: prompt.is_free ? '프롬프트 무료 다운로드 완료' : '프롬프트 다운로드 완료',
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
        nickname: prompt.user.nickname,
        statusCode: 200,
      };
    });
  }
};