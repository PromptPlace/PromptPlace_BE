"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toReportedPromptResponse = exports.toReportedPromptListResponse = exports.toCreateReportResponse = void 0;
// 신고 등록 응답 DTO
const toCreateReportResponse = ({ report_id, reporter_id, prompt_id, description, created_at }) => {
    return {
        report_id,
        reporter_id,
        prompt_id,
        description,
        created_at
    };
};
exports.toCreateReportResponse = toCreateReportResponse;
// 변환 함수(신고목록->api응답)
const toReportedPromptListResponse = (reports, limit // 페이징 제한 개수
) => {
    // DB 원본 데이터를 ReportedPromptDTO 배열로 변환
    const transformed = reports.map((report) => ({
        report_id: report.report_id,
        prompt_id: report.prompt.prompt_id,
        prompt_title: report.prompt.title,
        reporter_id: report.reporter.user_id,
        reporter_nickname: report.reporter.nickname,
        created_at: report.created_at.toISOString(),
        is_read: report.is_read
    }));
    // 최종 응답 객체 반환 (has_more은 페이징 기준으로 판단)
    return {
        reports: transformed,
        has_more: reports.length >= limit // limit보다 많으면 더 있음
    };
};
exports.toReportedPromptListResponse = toReportedPromptListResponse;
// 단일 신고 조회 변환 함수
const toReportedPromptResponse = (report) => {
    return {
        report: {
            report_id: report.report_id,
            prompt_id: report.prompt_id,
            prompt_title: report.prompt.title,
            reporter_id: report.reporter_id,
            reporter_nickname: report.reporter.nickname,
            reporter_email: report.reporter.email,
            prompt_type: report.report_type,
            description: report.description,
            created_at: report.created_at.toISOString(),
            isRead: report.is_read
        }
    };
};
exports.toReportedPromptResponse = toReportedPromptResponse;
