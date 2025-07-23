import  prisma  from "../../config/prisma";
import { SearchPromptDto } from "../dtos/search-prompt.dto";

export const searchPromptRepo = async (data: SearchPromptDto) => {
  const { model, tag, keyword, page, size, sort, is_free } = data;
  const skip = (page - 1) * size;

  // 정렬 기준
  let orderBy: any = { rating_avg: "desc" };
  if (sort === "recent") orderBy = { created_at: "desc" };
  else if (sort === "views") orderBy = { views: "desc" };
  else if (sort === "popular") orderBy = { likes: "desc" };

  // where 조건
  const where = {
    AND: [
      keyword && {
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { description: { contains: keyword, mode: "insensitive" } },
        ],
      },

      // 모델명 검색: PromptModel → Model
      model && {
        prompt_models: {
          some: {
            model: {
              name: model,
            },
          },
        },
      },

      // 태그 포함: PromptTag → Tag
      tag?.length > 0 && {
        prompt_tags: {
          some: {
            tag: {
              name: { in: tag },
            },
          },
        },
      },

      is_free && { is_free: true },
    ].filter(Boolean),
  };
  // 검색 + 이미지 포함
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
