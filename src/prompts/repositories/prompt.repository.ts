import { SearchPromptDto } from "../dtos/search-prompt.dto";
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function fetchReviewStatsByPromptIds(promptIds: number[]) {
  if (!promptIds.length) return new Map<number, { count: number; avg: number | null }>();

  const rows = await prisma.review.groupBy({
    by: ["prompt_id"],
    where: { prompt_id: { in: promptIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });

  const map = new Map<number, { count: number; avg: number | null }>();
  for (const r of rows) {
    map.set(r.prompt_id, {
      count: r._count._all,
      avg: r._avg.rating == null ? null : Math.round(r._avg.rating * 10) / 10,
    });
  }
  return map;
}

// ✅ 프롬프트 배열에 통계 붙이기
function attachReviewStats<T extends { prompt_id: number }>(
  items: T[],
  stats: Map<number, { count: number; avg: number | null }>
) {
  return items.map((it) => {
    const s = stats.get(it.prompt_id);
    return {
      ...it,
      review_count: s?.count ?? 0,
      review_rating_avg: s?.avg ?? 0,
    };
  });
}

export const searchPromptRepo = async (data: SearchPromptDto) => {
  const { model, category, keyword, page, size, sort, is_free } = data;
  const skip = (page - 1) * size;

  const filters: Prisma.PromptWhereInput[] = [];
  if (keyword?.trim()) {
    filters.push({
      OR: [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
      ],
    });
  }
  if (model && model.length > 0) {
    filters.push({
      models: { some: { model: { name: { in: model } } } },
    });
  }
  if (category && category.length > 0) {
    filters.push({
      categories: { some: { category: { name: { in: category } } } },
    });
  }
  if (is_free === true) filters.push({ is_free: true });

  const where: Prisma.PromptWhereInput = { AND: filters };

  // ✅ 기본 orderBy: created_at desc (recent)
  let orderBy: Prisma.PromptOrderByWithRelationInput | undefined;
  if (sort === "recent") orderBy = { created_at: "desc" };
  else if (sort === "popular") orderBy = { likes: "desc" };
  else if (sort === "views") orderBy = { views: "desc" };
  else if (sort === "download") orderBy = { downloads: "desc" };
  // rating_avg는 컬럼이 없으니 orderBy 설정 안 하고, 나중에 메모리에서 정렬

  const prompts = await prisma.prompt.findMany({
    where,
    orderBy: orderBy ?? undefined, // rating_avg일 경우 undefined
    skip,
    take: size,
    include: {
      user: {
        select: {
          user_id: true,
          nickname: true,
          profileImage: { select: { url: true } },
        },
      },
      models: { include: { model: { select: { name: true } } } },
      categories: { include: { category: { select: { category_id: true, name: true } } } },
      images: { select: { image_url: true }, orderBy: { order_index: "asc" } },
    },
  });

  // ✅ 리뷰 통계 붙이기
  const stats = await fetchReviewStatsByPromptIds(prompts.map((p) => p.prompt_id));
  let promptsWithStats = attachReviewStats(prompts, stats);

  // ✅ rating_avg 정렬일 경우 메모리에서 정렬
  if (sort === "rating_avg") {
    promptsWithStats = promptsWithStats.sort((a, b) => {
      const aRating = a.review_rating_avg ?? 0;
      const bRating = b.review_rating_avg ?? 0;
      return bRating - aRating; // 내림차순
    });
  }

  // ✅ 유저 검색
  let relatedUsers: any[] = [];
  if (keyword?.trim()) {
    // 1) 닉네임 매칭 → 팔로워 수 순
    const nicknameMatched = await prisma.user.findMany({
      where: { nickname: { contains: keyword } },
      select: {
        user_id: true,
        nickname: true,
        profileImage: { select: { url: true } },
      },
      take: 10,
    });

    // 팔로워 수 붙이기
    const nicknameMatchedWithFollowers = await Promise.all(
      nicknameMatched.map(async (u) => {
        const followerCount = await prisma.following.count({
          where: { following_id: u.user_id },
        });
        return { ...u, follower_count: followerCount };
      })
    );

    nicknameMatchedWithFollowers.sort((a, b) => b.follower_count - a.follower_count);

    const nicknameIds = nicknameMatchedWithFollowers.map((u) => u.user_id);

    // 2) 제목/설명 매칭 → 조회수+다운로드 합 순
    const promptAgg = await prisma.prompt.groupBy({
      by: ["user_id"],
      where: {
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
        ],
        user_id: { notIn: nicknameIds },
      },
      _sum: { views: true, downloads: true },
    });

    promptAgg.sort((a, b) => {
      const aTotal = (a._sum.views ?? 0) + (a._sum.downloads ?? 0);
      const bTotal = (b._sum.views ?? 0) + (b._sum.downloads ?? 0);
      return bTotal - aTotal;
    });

    const promptUsers = await prisma.user.findMany({
      where: { user_id: { in: promptAgg.map((p) => p.user_id) } },
      select: {
        user_id: true,
        nickname: true,
        profileImage: { select: { url: true } },
      },
    });

    const promptUsersWithTotals = promptUsers.map((u) => {
      const agg = promptAgg.find((p) => p.user_id === u.user_id);
      return {
        ...u,
        prompt_total: (agg?._sum.views ?? 0) + (agg?._sum.downloads ?? 0),
      };
    });

    relatedUsers = [...nicknameMatchedWithFollowers, ...promptUsersWithTotals].slice(0, 10);
  }

  return {
    prompts: promptsWithStats,
    related_users: relatedUsers,
  };
};



export const getAllPromptRepo = async () => {
  const results = await prisma.prompt.findMany({
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
      categories: {
        include: {
          category: {
            select: {
              category_id: true,
              name: true,
            },
          },
        },
      },
      images: {
        select: { image_url: true },
        orderBy: { order_index: "asc" },
      },
    },
  });

  if (results.length === 0) return [];

  // 2) 리뷰 통계 가져오기
  const stats = await fetchReviewStatsByPromptIds(results.map((p) => p.prompt_id));

  // 3) 통계 붙이기
  return attachReviewStats(results, stats);
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
  categories: { category_id: number; name: string }[];
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
  model_version: true,
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
  categories: {
    select: {
      category: { select: { category_id: true, name: true } },
    },
  },
  images: {
    select: { image_url: true, order_index: true },
    orderBy: { order_index: "asc" },
  },
});

export const getPromptDetailRepo = async (promptId: number) => {

  await prisma.prompt.update({
    where: { prompt_id: promptId },
    data: {
      views: { increment: 1 },
    },
  });

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
      categories: {
        include: {
          category: { select: { category_id: true, name: true } },
        },
      },
      images: {
        select: { image_url: true, order_index: true },
        orderBy: { order_index: "asc" },
      },
    },
  });

  if (!prompt) return null;

  // ✅ 리뷰 통계 가져오기 
  const stats = await fetchReviewStatsByPromptIds([prompt.prompt_id]);

  // ✅ 통계 붙이기
  const [promptWithStats] = attachReviewStats([prompt], stats);

  return promptWithStats;
};

export const createPromptWriteRepo = async (
  user_id: number,
  data: {
    title: string;
    prompt: string;
    prompt_result: string;
    model_version?: string;
    has_image: boolean;
    description: string;
    usage_guide: string;
    price: number;
    is_free: boolean;
    categories: string[];
    models: string[];
    
    
  }
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. 카테고리 처리: 각 카테고리가 Category 테이블에 존재하는지 확인
    const categoryIds: number[] = [];
    for (const categoryName of data.categories) {
      const category = await tx.category.findFirst({ where: { name: categoryName } });
      if (!category) {
        throw new Error(`카테고리 '${categoryName}'이(가) 존재하지 않습니다.`);
      }
      categoryIds.push(category.category_id);
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
      model_version: data.model_version,
      has_image: data.has_image,
      description: data.description,
      usage_guide: data.usage_guide,
      price: data.price,
      is_free: data.is_free,
      downloads: 0,
      views: 0,
      likes: 0,
    },
  });

    // 4. PromptCategory 매핑
    for (const category_id of categoryIds) {
      await tx.promptCategory.create({
        data: {
          prompt_id: prompt.prompt_id,
          category_id,
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
        categories: { include: { category: true } },
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
        select: { user_id: true, nickname: true },
      },
      categories: {
        include: { category: true },
      },
      models: {
        include: { model: true },
      },
    },
  });
};

export const updatePromptRepo = async (
  promptId: number,
  data: {
    title?: string;
    prompt?: string;
    prompt_result?: string;
    model_version?: string;
    has_image?: boolean;
    description?: string;
    usage_guide?: string;
    price?: number;
    is_free?: boolean;
    categories?: string[];
    models?: string[];
    
    
  }
) => {
  return await prisma.$transaction(async (tx) => {
    // 기존 카테고리, 모델 매핑 삭제
    if (data.categories || data.models) {
      if (data.categories) {
        await tx.promptCategory.deleteMany({
          where: { prompt_id: promptId },
        });
      }

      if (data.models) {
        await tx.promptModel.deleteMany({
          where: { prompt_id: promptId },
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
      model_version: data.model_version,
      has_image: data.has_image,
      description: data.description,
      usage_guide: data.usage_guide,
      price: data.price,
      is_free: data.is_free,
    }
  });

    // 새로운 카테고리 매핑
    if (data.categories) {
      const categoryIds: number[] = [];
      for (const categoryName of data.categories) {
        const category = await tx.category.findFirst({ where: { name: categoryName } });
        if (!category) {
          throw new Error(`카테고리 '${categoryName}'이(가) 존재하지 않습니다.`);
        }
        categoryIds.push(category.category_id);
      }

      for (const category_id of categoryIds) {
        await tx.promptCategory.create({
          data: {
            prompt_id: promptId,
            category_id,
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
        categories: { include: { category: true } },
        models: { include: { model: true } },
      },
    });
  });
};

export const deletePromptRepo = async (promptId: number) => {
  return await prisma.$transaction(async (tx) => {
    // 삭제 제약: 유료 프롬프트이고 구매 이력이 있으면 삭제 불가
    const prompt = await tx.prompt.findUnique({
      where: { prompt_id: promptId },
      select: { is_free: true },
    });
    if (!prompt) {
      throw new Error("프롬프트를 찾을 수 없습니다.");
    }
    if (prompt.is_free === false) {
      const purchaseCount = await tx.purchase.count({ where: { prompt_id: promptId } });
      if (purchaseCount > 0) {
        throw new Error("구매 이력이 있는 유료 프롬프트는 삭제할 수 없습니다.");
      }
    }

    // 관련된 Purchase 및 Payment 기록 삭제
    const purchases = await tx.purchase.findMany({
      where: { prompt_id: promptId },
      select: { purchase_id: true },
    });

    if (purchases.length > 0) {
      const purchaseIds = purchases.map((p) => p.purchase_id);
      await tx.payment.deleteMany({
        where: { purchase_id: { in: purchaseIds } },
      });
    }

    await tx.purchase.deleteMany({ where: { prompt_id: promptId } });

    // 관련 데이터 수동 삭제
    await tx.promptLike.deleteMany({ where: { prompt_id: promptId } });
    await tx.review.deleteMany({ where: { prompt_id: promptId } });
    await tx.promptReport.deleteMany({ where: { prompt_id: promptId } });
    await tx.promptCategory.deleteMany({ where: { prompt_id: promptId } });
    await tx.promptModel.deleteMany({ where: { prompt_id: promptId } });
    await tx.promptImage.deleteMany({ where: { prompt_id: promptId } });
    // 프롬프트 삭제
    return await tx.prompt.delete({
      where: { prompt_id: promptId },
    });
  });
};

export const adminDeletePromptRepo = async (promptId: number) => {
  return await prisma.$transaction(async (tx) => {
    // 프롬프트 존재 여부 확인
    const prompt = await tx.prompt.findUnique({
      where: { prompt_id: promptId },
      select: { prompt_id: true },
    });
    if (!prompt) {
      throw new Error("프롬프트를 찾을 수 없습니다.");
    }

    // 관련된 Purchase, Payment, Settlement 기록 삭제
    const purchases = await tx.purchase.findMany({
      where: { prompt_id: promptId },
      select: { purchase_id: true },
    });

    if (purchases.length > 0) {
      const purchaseIds = purchases.map((p) => p.purchase_id);

      const payments = await tx.payment.findMany({
        where: { purchase_id: { in: purchaseIds } },
        select: { payment_id: true },
      });

      if (payments.length > 0) {
        const paymentIds = payments.map((p) => p.payment_id);
        // settlement 삭제
        await tx.settlement.deleteMany({
          where: { payment_id: { in: paymentIds } },
        });
      }
      
      // payment 삭제
      await tx.payment.deleteMany({
        where: { purchase_id: { in: purchaseIds } },
      });
    }
    
    // purchase 삭제
    await tx.purchase.deleteMany({ where: { prompt_id: promptId } });

    // 관련 데이터 수동 삭제
    await tx.promptLike.deleteMany({ where: { prompt_id: promptId } });
    await tx.review.deleteMany({ where: { prompt_id: promptId } });
    await tx.promptReport.deleteMany({ where: { prompt_id: promptId } });
    await tx.promptCategory.deleteMany({ where: { prompt_id: promptId } });
    await tx.promptModel.deleteMany({ where: { prompt_id: promptId } });
    await tx.promptImage.deleteMany({ where: { prompt_id: promptId } });
    // 프롬프트 삭제
    return await tx.prompt.delete({
      where: { prompt_id: promptId },
    });
  });
};

export const getGroupedCategories = async () => {
  return await prisma.mainCategory.findMany({
    include: {
      categories: {
        select: {
          name: true,
        },
      },
    },
  });
};

export const getGroupedModels = async () => {
  return await prisma.modelCategory.findMany({
    include: {
      models: {
        select: {
          name: true,
        },
      },
    },
  });
};
