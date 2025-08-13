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
exports.findReportById = exports.markReportAsRead = exports.findAllReports = exports.findUserById = exports.createReport = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// 신고 등록 함수
const createReport = (_a) => __awaiter(void 0, [_a], void 0, function* ({ reporter_id, prompt_id, report_type, description }) {
    return yield prisma.promptReport.create({
        data: {
            reporter_id: reporter_id,
            prompt_id: prompt_id,
            report_type: report_type,
            description: description
        }
    });
});
exports.createReport = createReport;
// 사용자 ID로 사용자 정보 조회
const findUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.user.findUnique({
        where: {
            user_id: userId
        }
    });
});
exports.findUserById = findUserById;
// 신고 목록 조회 (페이징 지원)
const findAllReports = (cursor, limit) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.promptReport.findMany(Object.assign(Object.assign({ where: {}, orderBy: {
            report_id: 'desc' // 최신순 정렬
        }, take: limit }, (cursor && {
        skip: 1, // cursor 건너뛰기
        cursor: { report_id: cursor }
    })), { 
        // 관련된 프롬프트와 신고자 정보 포함
        include: {
            prompt: {
                select: {
                    prompt_id: true,
                    title: true,
                }
            },
            reporter: {
                select: {
                    user_id: true,
                    nickname: true
                }
            }
        } }));
});
exports.findAllReports = findAllReports;
// 읽음 처리
const markReportAsRead = (reportId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.promptReport.update({
        where: {
            report_id: reportId
        },
        data: {
            is_read: true
        }
    });
});
exports.markReportAsRead = markReportAsRead;
// reportId로 신고 개별 조회 
const findReportById = (reportId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.promptReport.findUnique({
        where: {
            report_id: reportId
        },
        include: {
            prompt: {
                select: {
                    title: true
                }
            },
            reporter: {
                select: {
                    nickname: true,
                    email: true
                }
            }
        }
    });
});
exports.findReportById = findReportById;
