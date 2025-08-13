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
exports.getReportedPromptById = exports.getReportedPrompts = exports.postReport = void 0;
const report_service_1 = require("../services/report.service");
// 신고 등록
const postReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: 'no user',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    try {
        const reporter_id = req.user.user_id;
        const result = yield (0, report_service_1.createReportService)(reporter_id, req.body.prompt_id, req.body.report_type, req.body.description);
        res.success(Object.assign({}, result));
    }
    catch (err) {
        console.error(err);
        res.fail({
            error: err.name || 'InternalServerError',
            message: err.message || '신고 등록 중 오류가 발생했습니다.',
            statusCode: err.statusCode || 500
        });
    }
});
exports.postReport = postReport;
// 신고된 프롬프트 목록 조회
const getReportedPrompts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: 'no user',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    try {
        const userId = req.user.user_id;
        const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
        const limit = typeof req.query.limit === 'string' ? req.query.limit : undefined;
        const reportedPrompts = yield (0, report_service_1.getReportedPromptsService)(userId, cursor, limit);
        res.success(Object.assign({}, reportedPrompts));
    }
    catch (err) {
        console.error(err);
        res.fail({
            error: err.name || 'InternalServerError',
            message: err.message || '신고된 프롬프트 조회 중 오류가 발생했습니다.',
            statusCode: err.statusCode || 500
        });
    }
});
exports.getReportedPrompts = getReportedPrompts;
// 특정 신고 조회
const getReportedPromptById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.fail({
            statusCode: 401,
            error: 'no user',
            message: '로그인이 필요합니다.',
        });
        return;
    }
    try {
        const userId = req.user.user_id;
        const reportId = parseInt(req.params.reportId, 10);
        const reportedPrompt = yield (0, report_service_1.getReportedPromptByIdService)(userId, reportId);
        res.success(Object.assign({}, reportedPrompt));
    }
    catch (err) {
        console.error(err);
        res.fail({
            error: err.name || 'InternalServerError',
            message: err.message || '특정 신고 조회 중 오류가 발생했습니다.',
            statusCode: err.statusCode || 500
        });
    }
});
exports.getReportedPromptById = getReportedPromptById;
