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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePrompt = exports.updatePrompt = exports.getPromptById = exports.createPromptWrite = exports.createPromptImage = exports.getPresignedUrl = exports.getPromptDetail = exports.searchPrompts = void 0;
const promptRepository = __importStar(require("../repositories/prompt.repository"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const eventBus_1 = __importDefault(require("../../config/eventBus"));
/**
 * 프롬프트 검색 서비스
 */
const searchPrompts = (dto) => __awaiter(void 0, void 0, void 0, function* () {
    return yield promptRepository.searchPromptRepo(dto);
});
exports.searchPrompts = searchPrompts;
const getPromptDetail = (promptId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield promptRepository.getPromptDetailRepo(promptId);
});
exports.getPromptDetail = getPromptDetail;
/**
 * S3 presigned url 발급 (key는 promptimages/uuid_파일명 형식으로 강제)
 * @param key 원본 파일 경로 또는 파일명
 * @param contentType 업로드할 파일의 Content-Type
 * @returns { url, key } presign url과 실제 S3에 저장될 key
 */
const getPresignedUrl = (key, contentType) => __awaiter(void 0, void 0, void 0, function* () {
    // 파일명 추출 및 uuid 추가 → S3에는 promptimages/uuid_파일명 으로 저장
    const lastSlash = key.lastIndexOf("/");
    const filename = lastSlash !== -1 ? key.substring(lastSlash + 1) : key;
    const newKey = `promptimages/${(0, uuid_1.v4)()}_${filename}`;
    // S3 클라이언트 생성
    const s3 = new client_s3_1.S3Client({
        region: process.env.S3_REGION,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
    });
    // presign url 발급용 커맨드 생성
    const command = new client_s3_1.PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: newKey,
        ContentType: contentType,
    });
    // presign url 발급 (5분 유효)
    const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 60 * 5 });
    return { url, key: newKey };
});
exports.getPresignedUrl = getPresignedUrl;
/**
 * PromptImage 매핑 생성 서비스
 * @param prompt_id 프롬프트 ID
 * @param dto { image_url, order_index }
 */
const createPromptImage = (prompt_id, dto) => __awaiter(void 0, void 0, void 0, function* () {
    return yield promptRepository.createPromptImageRepo(prompt_id, dto);
});
exports.createPromptImage = createPromptImage;
const createPromptWrite = (user_id, dto) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = yield promptRepository.createPromptWriteRepo(user_id, dto);
    // 새 프롬프트 업로드 알림 이벤트 발생
    eventBus_1.default.emit("prompt.created", user_id);
    return prompt;
});
exports.createPromptWrite = createPromptWrite;
const getPromptById = (promptId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield promptRepository.getPromptByIdRepo(promptId);
});
exports.getPromptById = getPromptById;
const updatePrompt = (promptId, dto) => __awaiter(void 0, void 0, void 0, function* () {
    return yield promptRepository.updatePromptRepo(promptId, dto);
});
exports.updatePrompt = updatePrompt;
const deletePrompt = (promptId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield promptRepository.deletePromptRepo(promptId);
});
exports.deletePrompt = deletePrompt;
