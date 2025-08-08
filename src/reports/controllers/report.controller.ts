import { Request, Response } from 'express';
import {
    createReportService,
    getReportedPromptsService,
    getReportedPromptByIdService,
} from '../services/report.service';

// 신고 등록
export const postReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.fail({
      statusCode: 401,
      error: 'no user',
      message: '로그인이 필요합니다.',
    });
    return;
  }

  try {
    const reporter_id = (req.user as { user_id: number }).user_id;
    const result = await createReportService(
      reporter_id, 
      req.body.prompt_id,
      req.body.report_type,
      req.body.description
    );

    res.success(
      {...result},
      "프롬프트 신고가 성공적으로 접수되었습니다."
  );
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.name || 'InternalServerError',
      message: err.message || '신고 등록 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500
    });
  }
};





// 신고된 프롬프트 목록 조회
export const getReportedPrompts = async (
  req: Request,
  res: Response
): Promise<void> => {
    if (!req.user) {
    res.fail({
      statusCode: 401,
      error: 'no user',
      message: '로그인이 필요합니다.',
    });
    return;
  }
  try {
    const userId = (req.user as { user_id: number }).user_id;
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const limit = typeof req.query.limit === 'string' ? req.query.limit : undefined;

    const reportedPrompts = await getReportedPromptsService(
      userId, 
      cursor,
      limit
    );
    res.success(
      {...reportedPrompts},
      "신고된 프롬프트 목록을 성공적으로 불러왔습니다."
    );
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.name || 'InternalServerError',
      message: err.message || '신고된 프롬프트 조회 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500
    });
  }
};




// 특정 신고 조회
export const getReportedPromptById = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.fail({
      statusCode: 401,
      error: 'no user',
      message: '로그인이 필요합니다.',
    });
    return;
  }

  try {
    const userId = (req.user as { user_id: number }).user_id;
    const reportId = parseInt(req.params.reportId, 10);

    const reportedPrompt = await getReportedPromptByIdService(
      userId,
      reportId
    );

    res.success(
      {...reportedPrompt},
      "프롬프트 신고 상세 정보를 성공적으로 불러왔습니다."

    );
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.name || 'InternalServerError',
      message: err.message || '특정 신고 조회 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500
    });
  }
};
