"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.PromptLikeService = void 0;
const promptLikeRepo = __importStar(require("../repositories/prompt.like.repository"));
const AppError_1 = require("../../errors/AppError");
exports.PromptLikeService = {
    likePrompt(userId, promptId) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = yield promptLikeRepo.findPromptById(promptId);
            if (!prompt) {
                throw new AppError_1.AppError('해당 프롬프트를 찾을 수 없습니다.', 404, 'NotFound');
            }
            const alreadyLiked = yield promptLikeRepo.hasLikedPrompt(userId, promptId);
            if (alreadyLiked) {
                throw new AppError_1.AppError('이미 찜한 프롬프트입니다.', 409, 'Conflict');
            }
            yield promptLikeRepo.addPromptLike(userId, promptId);
        });
    },
    getLikedPrompts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const likes = yield promptLikeRepo.getLikedPromptsByUser(userId);
            return likes.map((like) => {
                const prompt = like.prompt;
                return {
                    prompt_id: prompt.prompt_id,
                    title: prompt.title,
                    models: prompt.models.map((m) => m.model.name),
                    tags: prompt.tags.map((t) => t.tag.name),
                };
            });
        });
    },
    unlikePrompt(userId, promptId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield promptLikeRepo.hasLikedPrompt(userId, promptId);
            if (!existing) {
                throw new AppError_1.AppError('찜하지 않은 프롬프트입니다.', 404, 'NotFound');
            }
            yield promptLikeRepo.removePromptLike(userId, promptId);
        });
    },
};
