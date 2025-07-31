import {
    toCreateReportResponse,
    toReportedPromptListResponse,
    toReportedPromptResponse,
} from '../dtos/report.dto';
import {
    createReport,
    findUserById,
    findAllReports,
    markReportAsRead,
    findReportById,
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

export const getReportedPromptsService = async (
  userId: number,  
  rawCursor?: string,
  rawLimit?: string
) => {
  const user = await findUserById(userId);
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
  const reportedPrompts = await findAllReports(cursor, limit);
  return toReportedPromptListResponse(reportedPrompts, limit);
};





export const getReportedPromptByIdService = async (
  userId: number,
  reportId: number
) => {
  const user = await findUserById(userId);
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

  const reportedPrompt = await findReportById(reportId); // 신고 데이터 가져오기

  if (!reportedPrompt) {
    throw {
      name: 'NotFound',
      message: '신고된 프롬프트를 찾을 수 없습니다.',
      statusCode: 404
    };
  }

  await markReportAsRead(reportId); // 신고 읽음처리

  return toReportedPromptResponse(reportedPrompt);
};