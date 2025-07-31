import { SearchPromptDto } from "../dtos/search-prompt.dto";
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const searchPromptRepo = async (data: SearchPromptDto) => {
  const { model, tag, keyword, page, size, sort, is_free } = data;
  const skip = (page - 1) * size;

  // ✅ 정렬 기준
  let orderBy: Prisma.PromptOrderByWithRelationInput = { rating_avg: 'desc' };
  if (sort === 'recent') orderBy = { created_at: 'desc' };
  else if (sort === 'views') orderBy = { views: 'desc' };
  else if (sort === 'popular') orderBy = { likes: 'desc' };

  // ✅ 조건 분기로 where 필터 구성
  const filters: Prisma.PromptWhereInput[] = [];

  if (keyword?.trim()) {
    filters.push({
      OR: [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
      ],
    });
  }

  if (model) {
    filters.push({
      models: {
        some: {
          model: {
            name: model,
          },
        },
      },
    });
  }

  if (tag && tag.length > 0) {
    filters.push({
      tags: {
        some: {
          tag: {
            name: {
              in: tag,
            },
          },
        },
      },
    });
  }

  if (is_free === true) {
    filters.push({ is_free: true });
  }

  const where: Prisma.PromptWhereInput = {
    AND: filters,
  };

  // ✅ 쿼리 실행
  const results = await prisma.prompt.findMany({
    where,
    orderBy,
    skip,
    take: size,
    include: {
      images: {
        select: { image_url: true },
      },
    },
  });

  return results;
};

export const createPromptWriteRepo = async (
  user_id: number,
  data: {
    title: string;
    prompt: string;
    prompt_result: string;
    has_image: boolean;
    description: string;
    usage_guide: string;
    price: number;
    is_free: boolean;
    tags: string[];
    model: string;
  }
) => {
  // 1. 태그 처리: 각 태그마다 Tag 테이블에 존재하면 매핑, 없으면 생성 후 매핑
  const tagIds: number[] = [];
  for (const tagName of data.tags) {
    let tag = await prisma.tag.findFirst({ where: { name: tagName } });
    if (!tag) {
      tag = await prisma.tag.create({ data: { name: tagName } });
    }
    tagIds.push(tag.tag_id);
  }

  // 2. 모델 처리: 반드시 존재해야 하며, PromptModel에 매핑만 (없으면 에러)
  const model = await prisma.model.findFirst({ where: { name: data.model } });
  if (!model) {
    throw new Error("해당 모델이 존재하지 않습니다.");
  }

  // 3. 프롬프트 생성
  const prompt = await prisma.prompt.create({
    data: {
      user_id,
      title: data.title,
      prompt: data.prompt,
      prompt_result: data.prompt_result,
      has_image: data.has_image,
      description: data.description,
      usage_guide: data.usage_guide,
      price: data.price,
      is_free: data.is_free,
      downloads: 0,
      views: 0,
      likes: 0,
      review_counts: 0,
      rating_avg: 0,
    },
  });

  // 4. PromptTag 매핑
  for (const tag_id of tagIds) {
    await prisma.promptTag.create({
      data: {
        prompt_id: prompt.prompt_id,
        tag_id,
      },
    });
  }

  // 5. PromptModel 매핑
  await prisma.promptModel.create({
    data: {
      prompt_id: prompt.prompt_id,
      model_id: model.model_id,
    },
  });

  // 6. 결과 반환 (프롬프트 + 태그 + 모델 정보)
  const result = await prisma.prompt.findUnique({
    where: { prompt_id: prompt.prompt_id },
    include: {
      tags: { include: { tag: true } },
      models: { include: { model: true } },
    },
  });
  return result;
};

export const createPromptImageRepo = async (
  prompt_id: number,
  data: { image_url: string; order_index?: number }
) => {
  return await prisma.promptImage.create({
    data: {
      prompt_id,
      image_url: data.image_url,
      order_index: data.order_index ?? 0,
    },
  });
};

export const getPromptByIdRepo = async (promptId: number) => {
  return await prisma.prompt.findUnique({
    where: { prompt_id: promptId },
    include: {
      user: {
        select: { user_id: true, nickname: true }
      },
      tags: {
        include: { tag: true }
      },
      models: {
        include: { model: true }
      }
    }
  });
};

export const updatePromptRepo = async (
  promptId: number,
  data: {
    title?: string;
    prompt?: string;
    prompt_result?: string;
    has_image?: boolean;
    description?: string;
    usage_guide?: string;
    price?: number;
    is_free?: boolean;
    tags?: string[];
    model?: string;
  }
) => {
  // 기존 태그, 모델 매핑 삭제
  if (data.tags || data.model) {
    if (data.tags) {
      await prisma.promptTag.deleteMany({
        where: { prompt_id: promptId }
      });
    }
    
    if (data.model) {
      await prisma.promptModel.deleteMany({
        where: { prompt_id: promptId }
      });
    }
  }

  // 프롬프트 기본 정보 업데이트
  const updatedPrompt = await prisma.prompt.update({
    where: { prompt_id: promptId },
    data: {
      title: data.title,
      prompt: data.prompt,
      prompt_result: data.prompt_result,
      has_image: data.has_image,
      description: data.description,
      usage_guide: data.usage_guide,
      price: data.price,
      is_free: data.is_free,
    }
  });

  // 새로운 태그 매핑
  if (data.tags) {
    const tagIds: number[] = [];
    for (const tagName of data.tags) {
      let tag = await prisma.tag.findFirst({ where: { name: tagName } });
      if (!tag) {
        tag = await prisma.tag.create({ data: { name: tagName } });
      }
      tagIds.push(tag.tag_id);
    }

    for (const tag_id of tagIds) {
      await prisma.promptTag.create({
        data: {
          prompt_id: promptId,
          tag_id,
        },
      });
    }
  }

  // 새로운 모델 매핑
  if (data.model) {
    const model = await prisma.model.findFirst({ where: { name: data.model } });
    if (!model) {
      throw new Error('해당 모델이 존재하지 않습니다.');
    }

    await prisma.promptModel.create({
      data: {
        prompt_id: promptId,
        model_id: model.model_id,
      },
    });
  }

  // 업데이트된 프롬프트 반환
  return await prisma.prompt.findUnique({
    where: { prompt_id: promptId },
    include: {
      tags: { include: { tag: true } },
      models: { include: { model: true } },
    },
  });
};

export const deletePromptRepo = async (promptId: number) => {
  // 관련 데이터 삭제 (Cascade가 설정되어 있지 않은 경우 수동 삭제)
  await prisma.promptTag.deleteMany({
    where: { prompt_id: promptId }
  });
  
  await prisma.promptModel.deleteMany({
    where: { prompt_id: promptId }
  });
  
  await prisma.promptImage.deleteMany({
    where: { prompt_id: promptId }
  });

  // 프롬프트 삭제
  return await prisma.prompt.delete({
    where: { prompt_id: promptId }
  });
};
