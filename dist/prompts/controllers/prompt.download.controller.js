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
exports.PromptDownloadController = void 0;
const prompt_download_service_1 = require("../services/prompt.download.service");
exports.PromptDownloadController = {
    getPromptContent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // 사용자 인증 확인
            if (!req.user) {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: '로그인이 필요합니다.',
                    statusCode: 401,
                });
                return;
            }
            const userId = req.user.user_id;
            const promptId = Number(req.params.promptId);
            try {
                const result = yield prompt_download_service_1.PromptDownloadService.getPromptContent(userId, promptId);
                res.status(200).json(result);
            }
            catch (err) {
                const status = err.statusCode || 500;
                res.status(status).json({
                    error: err.error || 'InternalServerError',
                    message: err.message || '서버 오류가 발생했습니다.',
                    statusCode: status,
                });
                return;
            }
        });
    }
};
