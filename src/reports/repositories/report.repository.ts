
import { 
    PrismaClient, 
    ReportType, // report enum type
    PromptReport,
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


// 신고 목록 조회 (페이징 지원)
export const findAllReports = async (
  cursor?: number,
  limit: number = 10
) => {
  return await prisma.promptReport.findMany({
    where: {}, // 필터 없음-> 모든 신고 조회
    orderBy: {
      report_id: 'desc' // 최신순 정렬
    },
    take: limit + 1, 
    // cursor가 있으면 해당 cursor 이후의 데이터만 조회
    ...(cursor && {
      skip: 1, // cursor 건너뛰기
      cursor: { report_id: cursor }
    }),
    // 관련된 프롬프트와 신고자 정보 포함
    include: {
      prompt: { // 프롬프트
        select: {
          prompt_id: true,
          title: true,
        }
      },
      reporter: { // 신고자
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



// reportId로 신고 개별 조회 
export const findReportById = async (reportId: number) => {
  return await prisma.promptReport.findUnique({
    where: {
      report_id: reportId
    },
    include: {
      prompt: { // 프롬프트
        select: {
          title: true
        }
      },
      reporter: { // 신고자 
        select: {
          nickname: true,
          email: true
        }
      }
    }
  });
};