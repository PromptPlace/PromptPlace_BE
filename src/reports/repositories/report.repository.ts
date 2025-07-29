
import { 
    PrismaClient, 
    ReportType // report enum type
} from '@prisma/client';

const prisma = new PrismaClient();

    
// 신고 등록 입력 인터페이스
export interface CreateReportInput {
  reporter_id: number;
  prompt_id: number;
  report_type: ReportType;
  description: string;
}

// 신고 등록 함수
export const createReport = async ({
  reporter_id, 
  prompt_id,
  report_type,
  description
}: CreateReportInput) => {
    return await prisma.promptReport.create({
        data: {
          reporter_id: reporter_id,
          prompt_id: prompt_id,
          report_type: report_type,
          description: description
        }
    });
};

