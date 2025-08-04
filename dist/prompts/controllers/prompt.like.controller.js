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
exports.unlikePrompt = exports.getLikedPrompts = exports.likePrompt = void 0;
const prompt_like_service_1 = require("../services/prompt.like.service");
const likePrompt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        res.fail({
            statusCode: 401,
            error: 'Unauthorized',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    const userId = req.user.user_id;
    const promptId = parseInt(req.params.promptId, 10);
    try {
        yield prompt_like_service_1.PromptLikeService.likePrompt(userId, promptId);
        res.status(201).json({
            message: '프롬프트 찜 성공',
            statusCode: 201,
        });
    }
    catch (err) {
        res.fail({
            statusCode: err.statusCode || 500,
            error: err.error || 'InternalServerError',
            message: err.message || '알 수 없는 오류가 발생했습니다.',
        });
    }
});
exports.likePrompt = likePrompt;
const getLikedPrompts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        res.fail({
            statusCode: 401,
            error: 'Unauthorized',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    const userId = req.user.user_id;
    try {
        const result = yield prompt_like_service_1.PromptLikeService.getLikedPrompts(userId);
        res.success(result, '찜한 프롬프트 목록 조회 성공');
    }
    catch (err) {
        res.fail({
            statusCode: err.statusCode || 500,
            error: err.error || 'InternalServerError',
            message: err.message || '알 수 없는 오류가 발생했습니다.',
        });
    }
});
exports.getLikedPrompts = getLikedPrompts;
const unlikePrompt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: 'Unauthorized',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    const userId = req.user.user_id;
    const promptId = Number(req.params.promptId);
    try {
        yield prompt_like_service_1.PromptLikeService.unlikePrompt(userId, promptId);
        res.success(null, '프롬프트 찜 취소 성공');
    }
    catch (err) {
        res.fail({
            statusCode: err.statusCode || 500,
            error: err.error || 'InternalServerError',
            message: err.message || '서버 오류가 발생했습니다.',
        });
    }
});
exports.unlikePrompt = unlikePrompt;
