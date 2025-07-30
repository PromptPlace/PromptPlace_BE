import {
    toCreateReportResponse,
} from '../dtos/report.dto';
import {
    createReport,
} from '../repositories/report.repository';

import { ReportType } from '@prisma/client';


// 신고 등록 함수
export const createReportService = async (
  reporter_id: number,
  prompt_id: number, 
  report_type: ReportType, 
  description: string
) => {
  const newReport = await createReport({
    reporter_id,
    prompt_id,
    report_type,
    description
  });

  return toCreateReportResponse(newReport);
};
