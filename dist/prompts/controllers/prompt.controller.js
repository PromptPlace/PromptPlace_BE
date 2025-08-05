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
exports.deletePrompt = exports.updatePrompt = exports.createPrompt = exports.createPromptImage = exports.presignUrl = exports.getPromptDetails = exports.searchPrompts = void 0;
const promptService = __importStar(require("../services/prompt.service"));
const constants_1 = require("../../config/constants");
const errorHandler_1 = require("../../middlewares/errorHandler");
const searchPrompts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { model, tag, keyword, page = "1", size = String(constants_1.DEFAULT_PROMPT_SEARCH_SIZE), sort = "recent", is_free = "false", } = req.body;
        // 필수 값(키워드) 유효성 검증
        if (typeof keyword !== "string" || !keyword.trim()) {
            return res.status(400).json({ message: "검색 결과가 없습니다." });
        }
        // tag가 문자열인 경우 배열로 변환
        const tagArray = typeof tag === "string" ? [tag] : tag || [];
        const dto = {
            model: typeof model === "string" ? model : "",
            tag: tagArray,
            keyword,
            page: Number(page),
            size: Number(size),
            sort: sort,
            is_free: is_free === "true",
        };
        const results = yield promptService.searchPrompts(dto);
        return res.status(200).json({
            statusCode: 200,
            message: "프롬프트 검색 성공",
            data: results,
        });
    }
    catch (error) {
        return (0, errorHandler_1.errorHandler)(error, req, res, () => { });
    }
});
exports.searchPrompts = searchPrompts;
const getPromptDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promptId } = req.params;
        const promptIdNum = Number(promptId);
        if (isNaN(promptIdNum)) {
            return res.status(400).json({ message: "유효하지 않은 프롬프트 ID입니다." });
        }
        const promptDetails = yield promptService.getPromptDetail(promptIdNum);
        if (!promptDetails) {
            return res.status(404).json({ message: "해당 프롬프트를 찾을 수 없습니다." });
        }
        return res.status(200).json({
            statusCode: 200,
            message: "프롬프트 상세 조회 성공",
            data: promptDetails,
        });
    }
    catch (error) {
        return (0, errorHandler_1.errorHandler)(error, req, res, () => { });
    }
});
exports.getPromptDetails = getPromptDetails;
const presignUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, contentType } = req.body;
        if (!key || !contentType) {
            return res
                .status(400)
                .json({ message: "key와 contentType이 필요합니다." });
        }
        const { url, key: newKey } = yield promptService.getPresignedUrl(key, contentType);
        return res.status(200).json({ url, key: newKey });
    }
    catch (error) {
        return (0, errorHandler_1.errorHandler)(error, req, res, () => { });
    }
});
exports.presignUrl = presignUrl;
const createPromptImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promptId } = req.params;
        const { image_url, order_index } = req.body;
        if (!image_url) {
            return res.status(400).json({ message: "image_url이 필요합니다." });
        }
        const result = yield promptService.createPromptImage(Number(promptId), {
            image_url,
            order_index,
        });
        return res.status(201).json({
            statusCode: 201,
            message: "프롬프트 이미지 매핑 성공",
            data: result,
        });
    }
    catch (error) {
        return (0, errorHandler_1.errorHandler)(error, req, res, () => { });
    }
});
exports.createPromptImage = createPromptImage;
const createPrompt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Received Body:', req.body); // 디버깅용 로그
        // 1. 인증 확인
        if (!req.user) {
            return res.fail({
                statusCode: 401,
                error: 'Unauthorized',
                message: '인증이 필요합니다.',
            });
        }
        const userId = req.user.user_id;
        // 2. DTO 유효성 검사
        const dto = req.body;
        const requiredFields = [
            'title',
            'prompt',
            'prompt_result',
            'description',
            'price',
            'tags',
            'model',
            'is_free'
        ];
        const missingFields = requiredFields.filter(field => !dto[field] && dto[field] !== false);
        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields); // 디버깅용 로그
            return res.fail({
                statusCode: 400,
                error: 'BadRequest',
                message: `필수 필드(${missingFields.join(', ')})가 누락되었습니다.`,
            });
        }
        // has_image 기본값 설정
        dto.has_image = (_a = dto.has_image) !== null && _a !== void 0 ? _a : false;
        // 3. 서비스 호출
        const result = yield promptService.createPromptWrite(userId, dto);
        return res.status(201).success(result, '프롬프트 업로드 성공');
    }
    catch (error) {
        // 4. 서비스/레포지토리 레이어에서 발생한 특정 에러 처리
        if (error instanceof Error && error.message === '해당 모델이 존재하지 않습니다.') {
            return res.fail({
                statusCode: 404,
                error: 'NotFound',
                message: error.message,
            });
        }
        // 5. 그 외 모든 에러는 공통 핸들러로 위임
        return (0, errorHandler_1.errorHandler)(error, req, res, () => { });
    }
});
exports.createPrompt = createPrompt;
const updatePrompt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promptId } = req.params;
        const promptIdNum = Number(promptId);
        if (isNaN(promptIdNum)) {
            return res.fail({
                statusCode: 400,
                error: 'BadRequest',
                message: '유효하지 않은 프롬프트 ID입니다.',
            });
        }
        // 인증 확인
        if (!req.user) {
            return res.fail({
                statusCode: 401,
                error: 'Unauthorized',
                message: '인증이 필요합니다.',
            });
        }
        const userId = req.user.user_id;
        // 프롬프트 존재 및 권한 확인
        const existingPrompt = yield promptService.getPromptById(promptIdNum);
        if (!existingPrompt) {
            return res.fail({
                statusCode: 404,
                error: 'NotFound',
                message: '프롬프트를 찾을 수 없습니다.',
            });
        }
        if (existingPrompt.user_id !== userId) {
            return res.fail({
                statusCode: 403,
                error: 'Forbidden',
                message: '프롬프트를 수정할 권한이 없습니다.',
            });
        }
        const dto = req.body;
        const result = yield promptService.updatePrompt(promptIdNum, dto);
        return res.success(result, '프롬프트 수정 성공');
    }
    catch (error) {
        // 서비스/레포지토리 레이어에서 발생한 특정 에러 처리
        if (error instanceof Error && error.message === '해당 모델이 존재하지 않습니다.') {
            return res.fail({
                statusCode: 404,
                error: 'NotFound',
                message: error.message,
            });
        }
        return res.fail({
            statusCode: 500,
            error: 'InternalServerError',
            message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        });
    }
});
exports.updatePrompt = updatePrompt;
const deletePrompt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promptId } = req.params;
        const promptIdNum = Number(promptId);
        if (isNaN(promptIdNum)) {
            return res.fail({
                statusCode: 400,
                error: 'BadRequest',
                message: '유효하지 않은 프롬프트 ID입니다.',
            });
        }
        // 인증 확인
        if (!req.user) {
            return res.fail({
                statusCode: 401,
                error: 'Unauthorized',
                message: '인증이 필요합니다.',
            });
        }
        const userId = req.user.user_id;
        // 프롬프트 존재 및 권한 확인
        const existingPrompt = yield promptService.getPromptById(promptIdNum);
        if (!existingPrompt) {
            return res.fail({
                statusCode: 404,
                error: 'NotFound',
                message: '프롬프트를 찾을 수 없습니다.',
            });
        }
        if (existingPrompt.user_id !== userId) {
            return res.fail({
                statusCode: 403,
                error: 'Forbidden',
                message: '프롬프트를 삭제할 권한이 없습니다.',
            });
        }
        yield promptService.deletePrompt(promptIdNum);
        return res.success(null, '프롬프트 삭제 성공');
    }
    catch (error) {
        return res.fail({
            statusCode: 500,
            error: 'InternalServerError',
            message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        });
    }
});
exports.deletePrompt = deletePrompt;
