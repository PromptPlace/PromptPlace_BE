
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


// 사용자 ID로 사용자 정보 조회
export const findUserById = async (userId: number) => {
  return await prisma.user.findUnique({
    where: {
      user_id: userId
    }
  });
}; 


// 신고 단건 조회
export const findReportById = async (reportId: number) => {
  return await prisma.promptReport.findUnique({
    where: {
      report_id: reportId
    }
  });
};

// 신고 목록 조회 (페이징 지원)
export const findAllReports = async (
  cursor?: number,
  limit: number = 10
) => {
  return await prisma.promptReport.findMany({
    where: {},
    orderBy: {
      report_id: 'desc'
    },
    take: limit,
    ...(cursor && {
      skip: 1,
      cursor: { report_id: cursor }
    }),
    include: {
      prompt: {
        select: {
          prompt_id: true,
          title: true
        }
      },
      reporter: {
        select: {
          user_id: true,
          nickname: true
        }
      }
    }
  });
};

// 읽음 처리
export const markReportAsRead = async (reportId: number) => {
  return await prisma.promptReport.update({
    where: {
      report_id: reportId
    },
    data: {
      is_read: true
    }
  });
};