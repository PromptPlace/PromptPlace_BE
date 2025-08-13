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

export const getAllPromptRepo = async () => {
  return await prisma.prompt.findMany({
    include: {
      user: {
        select: {
          user_id: true,
          nickname: true,
          profileImage: {
            select: { url: true },
          },
        },
      },
      models: {
        include: {
          model: {
            select: { name: true },
          },
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              tag_id: true,
              name: true,
            },
          },
        },
      },
      images: {
        select: { image_url: true },
        orderBy: { order_index: 'asc' },
      },
    },
  });
};

export type PromptDetail = {
  title: string;
  prompt: string;
  prompt_result: string | null;
  has_image: boolean;
  description: string | null;
  usage_guide: string | null;
  price: number | null;
  is_free: boolean;
  views: number; // 👈 추가
  tags: { tag_id: number; name: string }[];
  models: string[];
  images: string[];
  writer: {
    user_id: number;
    nickname: string;
    profile_image_url: string | null;
  };
};

const promptSelect = Prisma.validator<Prisma.PromptSelect>()({
  title: true,
  prompt: true,
  prompt_result: true,
  has_image: true,
  description: true,
  usage_guide: true,
  price: true,
  is_free: true,
  views: true, // 👈 추가
  user: {
    select: {
      user_id: true,
      nickname: true,
      profileImage: { select: { url: true } },
    },
  },
  models: {
    select: {
      model: { select: { name: true } },
    },
  },
  tags: {
    select: {
      tag: { select: { tag_id: true, name: true } },
    },
  },
  images: {
    select: { image_url: true, order_index: true },
    orderBy: { order_index: "asc" },
  },
});

export const getPromptDetailRepo = async (promptId: number) => {
  const prompt = await prisma.prompt.findUnique({
    where: { prompt_id: promptId },
    include: {
      user: {
        select: {
          user_id: true,
          nickname: true,
          profileImage: { select: { url: true } },
        },
      },
      models: {
        include: {
          model: { select: { name: true } },
        },
      },
      tags: {
        include: {
          tag: { select: { tag_id: true, name: true } },
        },
      },
      images: {
        select: { image_url: true, order_index: true },
        orderBy: { order_index: "asc" },
      },
    },
  });

  return prompt;
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
    models: string[];
    
  }
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. 태그 처리: 각 태그마다 Tag 테이블에 존재하면 매핑, 없으면 생성 후 매핑
    const tagIds: number[] = [];
    for (const tagName of data.tags) {
      let tag = await tx.tag.findFirst({ where: { name: tagName } });
      if (!tag) {
        tag = await tx.tag.create({ data: { name: tagName } });
      }
      tagIds.push(tag.tag_id);
    }

    // 2. 모델 처리: 각 모델이 존재하는지 확인하고 ID 수집
    const modelIds: number[] = [];
    for (const modelName of data.models) {
      const model = await tx.model.findFirst({ where: { name: modelName } });
      if (!model) {
        throw new Error(`모델 '${modelName}'이(가) 존재하지 않습니다.`);
      }
      modelIds.push(model.model_id);
    }

    // 3. 프롬프트 생성
    const prompt = await tx.prompt.create({
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
    await tx.promptTag.create({
      data: {
        prompt_id: prompt.prompt_id,
        tag_id,
      },
    });
  }

  // 5. PromptModel 매핑 (여러 모델)
  for (const model_id of modelIds) {
    await tx.promptModel.create({
      data: {
        prompt_id: prompt.prompt_id,
        model_id,
      },
    });
  }

  // 6. 결과 반환 (프롬프트 + 태그 + 모델 정보)
  const result = await tx.prompt.findUnique({
    where: { prompt_id: prompt.prompt_id },
    include: {
      tags: { include: { tag: true } },
      models: { include: { model: true } },
    },
  });
  return result;
  });
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
    models?: string[];
    
  }
) => {
  return await prisma.$transaction(async (tx) => {
    // 기존 태그, 모델 매핑 삭제
    if (data.tags || data.models) {
      if (data.tags) {
        await tx.promptTag.deleteMany({
          where: { prompt_id: promptId }
        });
      }
      
      if (data.models) {
        await tx.promptModel.deleteMany({
          where: { prompt_id: promptId }
        });
      }
    }

    // 프롬프트 기본 정보 업데이트
    const updatedPrompt = await tx.prompt.update({
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
      let tag = await tx.tag.findFirst({ where: { name: tagName } });
      if (!tag) {
        tag = await tx.tag.create({ data: { name: tagName } });
      }
      tagIds.push(tag.tag_id);
    }

    for (const tag_id of tagIds) {
      await tx.promptTag.create({
        data: {
          prompt_id: promptId,
          tag_id,
        },
      });
    }
  }

  // 새로운 모델 매핑 (여러 모델)
  if (data.models) {
    const modelIds: number[] = [];
    for (const modelName of data.models) {
      const model = await tx.model.findFirst({ where: { name: modelName } });
      if (!model) {
        throw new Error(`모델 '${modelName}'이(가) 존재하지 않습니다.`);
      }
      modelIds.push(model.model_id);
    }

    for (const model_id of modelIds) {
      await tx.promptModel.create({
        data: {
          prompt_id: promptId,
          model_id,
        },
      });
    }
  }

  // 업데이트된 프롬프트 반환
  return await tx.prompt.findUnique({
    where: { prompt_id: promptId },
    include: {
      tags: { include: { tag: true } },
      models: { include: { model: true } },
    },
  });
  });
};

export const deletePromptRepo = async (promptId: number) => {
  return await prisma.$transaction(async (tx) => {
    // 관련 데이터 삭제 (Cascade가 설정되어 있지 않은 경우 수동 삭제)
    await tx.promptTag.deleteMany({
      where: { prompt_id: promptId }
    });
    
    await tx.promptModel.deleteMany({
      where: { prompt_id: promptId }
    });
    
    await tx.promptImage.deleteMany({
      where: { prompt_id: promptId }
    });

    // 프롬프트 삭제
    return await tx.prompt.delete({
    where: { prompt_id: promptId }
  });
  });
};
