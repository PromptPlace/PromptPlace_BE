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
exports.removePromptLike = exports.getLikedPromptsByUser = exports.addPromptLike = exports.hasLikedPrompt = exports.findPromptById = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const findPromptById = (promptId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.prompt.findUnique({
        where: { prompt_id: promptId },
    });
});
exports.findPromptById = findPromptById;
const hasLikedPrompt = (userId, promptId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.promptLike.findUnique({
        where: {
            user_id_prompt_id: {
                user_id: userId,
                prompt_id: promptId,
            },
        },
    });
});
exports.hasLikedPrompt = hasLikedPrompt;
const addPromptLike = (userId, promptId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.promptLike.create({
        data: {
            user_id: userId,
            prompt_id: promptId,
        },
    });
});
exports.addPromptLike = addPromptLike;
const getLikedPromptsByUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.promptLike.findMany({
        where: { user_id: userId },
        include: {
            prompt: {
                select: {
                    prompt_id: true,
                    title: true,
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
                                select: { name: true },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            created_at: 'desc',
        },
    });
});
exports.getLikedPromptsByUser = getLikedPromptsByUser;
const removePromptLike = (userId, promptId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.promptLike.delete({
        where: {
            user_id_prompt_id: {
                user_id: userId,
                prompt_id: promptId,
            },
        },
    });
});
exports.removePromptLike = removePromptLike;
