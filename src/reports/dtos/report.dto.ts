
import { PromptReport } from '@prisma/client';


// 신고 등록 응답 인터페이스
export interface CreateReportResponse {
  report_id: number;
  reporter_id: number;
  prompt_id: number;
  description: string;
  created_at: Date;
}
// 신고 등록 응답 DTO
export const toCreateReportResponse = ({
    report_id,
    reporter_id,
    prompt_id,
    description,
    created_at
}: PromptReport): CreateReportResponse => {
  return {
    report_id,
    reporter_id,
    prompt_id,
    description,
    created_at
  };
};




// 개별 신고 항목 DTO
export interface ReportedPromptDTO {
  report_id: number;
  prompt_id: number;
  prompt_title: string;
  reporter_id: number;
  reporter_nickname: string;
  created_at: string;
  is_read: boolean;
}


// 전체 응답 DTO
export interface ReportedPromptListResponse {
  reports: ReportedPromptDTO[];// 신고 목록 배열
  has_more: boolean; // 다음 페이지 여부
  total_count: number; // 전체 신고 수
}


// 변환 함수
export const toReportedPromptListResponse = (
  reports: (PromptReport & {
    prompt: { prompt_id: number; title: string };// 프롬프트 정보 (프롬프트 ID & 제목)
    reporter: { user_id: number; nickname: string };// 신고자 정보 (ID & 닉네임)
  })[],
  hasMore: boolean,
  totalCount: number
): ReportedPromptListResponse => {

  // 개별 신고 항목 변환 
  const transformed: ReportedPromptDTO[] = reports.map((report) => ({
    report_id: report.report_id,
    prompt_id: report.prompt.prompt_id,
    prompt_title: report.prompt.title,
    reporter_id: report.reporter.user_id,
    reporter_nickname: report.reporter.nickname,
    created_at: report.created_at.toISOString(),
    is_read: report.is_read,
  }));
  
  // 최종 응답 객체 반환 (has_more은 페이징 기준으로 판단)
  return {
    reports: transformed,
    has_more: hasMore,
    total_count: totalCount
  };
};






// 단일 신고 응답 타입
export interface ReportedPromptDetailDTO {
  report_id: number;
  prompt_id: number;
  prompt_title: string;
  reporter_id: number;
  reporter_nickname: string;
  reporter_email: string;
  prompt_type: string; // Enum: ReportType
  description: string;
  created_at: string;
  isRead: boolean;
}

// 단일 신고 조회 변환 함수
export const toReportedPromptResponse = (
  report: PromptReport & {
    prompt: { title: string };
    reporter: { nickname: string; email: string };
  }
): ReportedPromptDetailDTO => {
  return {
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
  };
};
