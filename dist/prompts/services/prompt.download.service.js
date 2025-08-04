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
exports.PromptDownloadService = void 0;
const prompt_download_repository_1 = require("../repositories/prompt.download.repository");
const AppError_1 = require("../../errors/AppError");
exports.PromptDownloadService = {
    getPromptContent(userId, promptId) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = yield prompt_download_repository_1.PromptDownloadRepository.findById(promptId);
            if (!prompt) {
                throw new AppError_1.AppError('해당 프롬프트를 찾을 수 없습니다.', 404, 'NotFound');
            }
            // 유료 프롬프트인 경우 다운로드 불가 처리
            if (!prompt.is_free) {
                throw new AppError_1.AppError('해당 프롬프트는 무료가 아닙니다.', 403, 'Forbidden');
            }
            return {
                message: '프롬프트 무료 다운로드 완료',
                title: prompt.title,
                prompt: prompt.prompt,
                is_free: prompt.is_free,
                statusCode: 200,
            };
        });
    }
};
