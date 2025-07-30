
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

