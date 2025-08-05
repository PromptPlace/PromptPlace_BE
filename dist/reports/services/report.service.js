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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportedPromptByIdService = exports.getReportedPromptsService = exports.createReportService = void 0;
const report_dto_1 = require("../dtos/report.dto");
const report_repository_1 = require("../repositories/report.repository");
const eventBus_1 = __importDefault(require("../../config/eventBus"));
// 신고 등록 함수
const createReportService = (reporter_id, prompt_id, report_type, description) => __awaiter(void 0, void 0, void 0, function* () {
    const newReport = yield (0, report_repository_1.createReport)({
        reporter_id,
        prompt_id,
        report_type,
        description
    });
    // 알림 이벤트 발생 → 리스너에서 처리
    eventBus_1.default.emit('report.created', newReport.reporter_id);
    return (0, report_dto_1.toCreateReportResponse)(newReport);
});
exports.createReportService = createReportService;
const getReportedPromptsService = (userId, rawCursor, rawLimit) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, report_repository_1.findUserById)(userId);
    if (!user) {
        throw {
            name: 'NotFound',
            message: '해당 사용자를 찾을 수 없습니다.',
            statusCode: 404
        };
    }
    const isAdmin = user.role === 'ADMIN'; // 관리자 여부 확인
    if (!isAdmin) {
        throw {
            name: 'Forbidden',
            message: '관리자 권한이 필요합니다.',
            statusCode: 403
        };
    }
    const cursor = rawCursor ? parseInt(rawCursor, 10) : undefined;
    const limit = rawLimit ? parseInt(rawLimit, 10) : 10;
    // 관리자 권한이 있는 사용자만 신고된 프롬프트 조회 가능
    const reportedPrompts = yield (0, report_repository_1.findAllReports)(cursor, limit);
    return (0, report_dto_1.toReportedPromptListResponse)(reportedPrompts, limit);
});
exports.getReportedPromptsService = getReportedPromptsService;
const getReportedPromptByIdService = (userId, reportId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, report_repository_1.findUserById)(userId);
    if (!user) {
        throw {
            name: 'NotFound',
            message: '해당 사용자를 찾을 수 없습니다.',
            statusCode: 404
        };
    }
    const isAdmin = user.role === 'ADMIN'; // 관리자 여부 확인
    if (!isAdmin) {
        throw {
            name: 'Forbidden',
            message: '관리자 권한이 필요합니다.',
            statusCode: 403
        };
    }
    const reportedPrompt = yield (0, report_repository_1.findReportById)(reportId); // 신고 데이터 가져오기
    if (!reportedPrompt) {
        throw {
            name: 'NotFound',
            message: '신고된 프롬프트를 찾을 수 없습니다.',
            statusCode: 404
        };
    }
    yield (0, report_repository_1.markReportAsRead)(reportId); // 신고 읽음처리
    return (0, report_dto_1.toReportedPromptResponse)(reportedPrompt);
});
exports.getReportedPromptByIdService = getReportedPromptByIdService;
