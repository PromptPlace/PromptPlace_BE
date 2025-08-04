"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePromptRepo = exports.updatePromptRepo = exports.getPromptByIdRepo = exports.createPromptImageRepo = exports.createPromptWriteRepo = exports.getPromptDetailRepo = exports.searchPromptRepo = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const searchPromptRepo = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { model, tag, keyword, page, size, sort, is_free } = data;
    const skip = (page - 1) * size;
    // ✅ 정렬 기준
    let orderBy = { rating_avg: 'desc' };
    if (sort === 'recent')
        orderBy = { created_at: 'desc' };
    else if (sort === 'views')
        orderBy = { views: 'desc' };
    else if (sort === 'popular')
        orderBy = { likes: 'desc' };
    // ✅ 조건 분기로 where 필터 구성
    const filters = [];
    if (keyword === null || keyword === void 0 ? void 0 : keyword.trim()) {
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
    const where = {
        AND: filters,
    };
    // ✅ 쿼리 실행
    const results = yield prisma.prompt.findMany({
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
});
exports.searchPromptRepo = searchPromptRepo;
const getPromptDetailRepo = (promptId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const prompt = yield prisma.prompt.findUnique({
        where: { prompt_id: promptId },
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
                select: {
                    image_url: true,
                },
                orderBy: {
                    order_index: 'asc',
                },
            },
        },
    });
    if (!prompt)
        return null;
    const { title, prompt: promptText, prompt_result, has_image, description, usage_guide, price, is_free, models, tags, images, user, } = prompt;
    return {
        title,
        prompt: promptText,
        prompt_result,
        has_image,
        description,
        usage_guide,
        price,
        is_free,
        tags: tags.map(({ tag }) => ({
            tag_id: tag.tag_id,
            name: tag.name,
        })),
        models: models.map(({ model }) => model.name),
        images: images.map(({ image_url }) => image_url),
        writer: {
            user_id: user.user_id,
            nickname: user.nickname,
            profile_image_url: (_b = (_a = user.profileImage) === null || _a === void 0 ? void 0 : _a.url) !== null && _b !== void 0 ? _b : null,
        },
    };
});
exports.getPromptDetailRepo = getPromptDetailRepo;
const createPromptWriteRepo = (user_id, data) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. 태그 처리: 각 태그마다 Tag 테이블에 존재하면 매핑, 없으면 생성 후 매핑
    const tagIds = [];
    for (const tagName of data.tags) {
        let tag = yield prisma.tag.findFirst({ where: { name: tagName } });
        if (!tag) {
            tag = yield prisma.tag.create({ data: { name: tagName } });
        }
        tagIds.push(tag.tag_id);
    }
    // 2. 모델 처리: 반드시 존재해야 하며, PromptModel에 매핑만 (없으면 에러)
    const model = yield prisma.model.findFirst({ where: { name: data.model } });
    if (!model) {
        throw new Error("해당 모델이 존재하지 않습니다.");
    }
    // 3. 프롬프트 생성
    const prompt = yield prisma.prompt.create({
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
            download_url: data.download_url,
        },
    });
    // 4. PromptTag 매핑
    for (const tag_id of tagIds) {
        yield prisma.promptTag.create({
            data: {
                prompt_id: prompt.prompt_id,
                tag_id,
            },
        });
    }
    // 5. PromptModel 매핑
    yield prisma.promptModel.create({
        data: {
            prompt_id: prompt.prompt_id,
            model_id: model.model_id,
        },
    });
    // 6. 결과 반환 (프롬프트 + 태그 + 모델 정보)
    const result = yield prisma.prompt.findUnique({
        where: { prompt_id: prompt.prompt_id },
        include: {
            tags: { include: { tag: true } },
            models: { include: { model: true } },
        },
    });
    return result;
});
exports.createPromptWriteRepo = createPromptWriteRepo;
const createPromptImageRepo = (prompt_id, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    return yield prisma.promptImage.create({
        data: {
            prompt_id,
            image_url: data.image_url,
            order_index: (_a = data.order_index) !== null && _a !== void 0 ? _a : 0,
        },
    });
});
exports.createPromptImageRepo = createPromptImageRepo;
const getPromptByIdRepo = (promptId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.prompt.findUnique({
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
});
exports.getPromptByIdRepo = getPromptByIdRepo;
const updatePromptRepo = (promptId, data) => __awaiter(void 0, void 0, void 0, function* () {
    // 기존 태그, 모델 매핑 삭제
    if (data.tags || data.model) {
        if (data.tags) {
            yield prisma.promptTag.deleteMany({
                where: { prompt_id: promptId }
            });
        }
        if (data.model) {
            yield prisma.promptModel.deleteMany({
                where: { prompt_id: promptId }
            });
        }
    }
    // 프롬프트 기본 정보 업데이트
    const updatedPrompt = yield prisma.prompt.update({
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
        const tagIds = [];
        for (const tagName of data.tags) {
            let tag = yield prisma.tag.findFirst({ where: { name: tagName } });
            if (!tag) {
                tag = yield prisma.tag.create({ data: { name: tagName } });
            }
            tagIds.push(tag.tag_id);
        }
        for (const tag_id of tagIds) {
            yield prisma.promptTag.create({
                data: {
                    prompt_id: promptId,
                    tag_id,
                },
            });
        }
    }
    // 새로운 모델 매핑
    if (data.model) {
        const model = yield prisma.model.findFirst({ where: { name: data.model } });
        if (!model) {
            throw new Error('해당 모델이 존재하지 않습니다.');
        }
        yield prisma.promptModel.create({
            data: {
                prompt_id: promptId,
                model_id: model.model_id,
            },
        });
    }
    // 업데이트된 프롬프트 반환
    return yield prisma.prompt.findUnique({
        where: { prompt_id: promptId },
        include: {
            tags: { include: { tag: true } },
            models: { include: { model: true } },
        },
    });
});
exports.updatePromptRepo = updatePromptRepo;
const deletePromptRepo = (promptId) => __awaiter(void 0, void 0, void 0, function* () {
    // 관련 데이터 삭제 (Cascade가 설정되어 있지 않은 경우 수동 삭제)
    yield prisma.promptTag.deleteMany({
        where: { prompt_id: promptId }
    });
    yield prisma.promptModel.deleteMany({
        where: { prompt_id: promptId }
    });
    yield prisma.promptImage.deleteMany({
        where: { prompt_id: promptId }
    });
    // 프롬프트 삭제
    return yield prisma.prompt.delete({
        where: { prompt_id: promptId }
    });
});
exports.deletePromptRepo = deletePromptRepo;
