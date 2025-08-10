import { Request, Response } from "express";
import { SearchPromptDto } from "../dtos/search-prompt.dto";
import * as promptService from "../services/prompt.service";
import { DEFAULT_PROMPT_SEARCH_SIZE } from "../../config/constants";
import { errorHandler } from "../../middlewares/errorHandler";
import { CreatePromptImageDto } from "../dtos/prompt-image.dto";
import { CreatePromptDto } from "../dtos/create-prompt.dto";
import { UpdatePromptDto } from '../dtos/update-prompt.dto';

export const searchPrompts = async (req: Request, res: Response) => {
  try {
    const {
      model,
      tag,
      keyword,
      page = "1",
      size = String(DEFAULT_PROMPT_SEARCH_SIZE),
      sort = "recent",
      is_free = "false",
    } = req.body;

    // 필수 값(키워드) 유효성 검증
    if (typeof keyword !== "string" || !keyword.trim()) {
      return res.status(400).json({ message: "검색 결과가 없습니다." });
    }

    // tag가 문자열인 경우 배열로 변환
    const tagArray = typeof tag === "string" ? [tag] : (tag as string[]) || [];

    const dto: SearchPromptDto = {
      model: typeof model === "string" ? model : "",
      tag: tagArray,
      keyword,
      page: Number(page),
      size: Number(size),
      sort: sort as SearchPromptDto["sort"],
      is_free: is_free === "true",
    };

    const results = await promptService.searchPrompts(dto);

    return res.status(200).json({
      statusCode: 200,
      message: "프롬프트 검색 성공",
      data: results,
    });
  } catch (error) {
    return errorHandler(error, req, res, () => {});
  }
};

export const getAllPrompts = async (req: Request, res: Response) => {
  try {
    const promptList = await promptService.getAllPrompts();
    if (!promptList) {
      return res.status(404).json({ message: "프롬프트가 존재하지 않습니다." });
    }
    return res.status(200).json({
      statusCode: 200,
      message: "프롬프트 전체 조회 성공",
      data: promptList,
    });
  } catch (error) {
    return errorHandler(error, req, res, () => {});
  }
}

export const getPromptDetails = async (req: Request, res: Response) => {
  try {
    const { promptId } = req.params;
    const promptIdNum = Number(promptId);
    if (isNaN(promptIdNum)) {
      return res.status(400).json({ message: "유효하지 않은 프롬프트 ID입니다." });
    } 
    const promptDetails = await promptService.getPromptDetail(promptIdNum);
    if (!promptDetails) {
      return res.status(404).json({ message: "해당 프롬프트를 찾을 수 없습니다." });
    }
    return res.status(200).json({
      statusCode: 200,
      message: "프롬프트 상세 조회 성공",
      data: promptDetails,
    });
  } catch (error) {
    return errorHandler(error, req, res, () => {});
  }
}

export const presignUrl = async (req: Request, res: Response) => {
  try {
    const { key, contentType } = req.body;
    if (!key || !contentType) {
      return res
        .status(400)
        .json({ message: "key와 contentType이 필요합니다." });
    }
    const { url, key: newKey } = await promptService.getPresignedUrl(
      key,
      contentType
    );
    return res.status(200).json({ url, key: newKey });
  } catch (error) {
    return errorHandler(error, req, res, () => {});
  }
};

export const createPromptImage = async (req: Request, res: Response) => {
  try {
    const { promptId } = req.params;
    const { image_url, order_index } = req.body;
    if (!image_url) {
      return res.status(400).json({ message: "image_url이 필요합니다." });
    }
    const result = await promptService.createPromptImage(Number(promptId), {
      image_url,
      order_index,
    });
    return res.status(201).json({
      statusCode: 201,
      message: "프롬프트 이미지 매핑 성공",
      data: result,
    });
  } catch (error) {
    return errorHandler(error, req, res, () => {});
  }
};


export const createPrompt = async (req: Request, res: Response) => {
  try {
    console.log('Received Body:', req.body); // 디버깅용 로그

    // 1. 인증 확인
    if (!req.user) {
      return res.fail({
        statusCode: 401,
        error: 'Unauthorized',
        message: '인증이 필요합니다.',
      });
    }
    const userId = (req.user as { user_id: number }).user_id;

    // 2. DTO 유효성 검사
    const dto = req.body;
    const requiredFields = [
      'title',
      'prompt',
      'prompt_result',
      'description',
      'price',
      'tags',
      'models',
      'is_free',
      'download_url'
    ];

    const missingFields = requiredFields.filter(field => !dto[field] && dto[field] !== false);
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields); // 디버깅용 로그
      return res.fail({
        statusCode: 400,
        error: 'BadRequest',
        message: `필수 필드(${missingFields.join(', ')})가 누락되었습니다.`,
      });
    }

    // has_image 기본값 설정
    dto.has_image = dto.has_image ?? false;

    // 3. 서비스 호출
    const result = await promptService.createPromptWrite(userId, dto);
    return res.status(201).success(result, '프롬프트 업로드 성공');

  } catch (error) {
    // 4. 서비스/레포지토리 레이어에서 발생한 특정 에러 처리
    if (error instanceof Error && error.message.includes('모델') && error.message.includes('존재하지 않습니다')) {
      return res.fail({
        statusCode: 404,
        error: 'NotFound',
        message: error.message,
      });
    }

    // 5. 그 외 모든 에러는 공통 핸들러로 위임
    return errorHandler(error, req, res, () => {});
  }
};

export const updatePrompt = async (req: Request, res: Response) => {
  try {
    const { promptId } = req.params;
    const promptIdNum = Number(promptId);
    
    if (isNaN(promptIdNum)) {
      return res.fail({
        statusCode: 400,
        error: 'BadRequest',
        message: '유효하지 않은 프롬프트 ID입니다.',
      });
    }

    // 인증 확인
    if (!req.user) {
      return res.fail({
        statusCode: 401,
        error: 'Unauthorized',
        message: '인증이 필요합니다.',
      });
    }
    const userId = (req.user as { user_id: number }).user_id;

    // 프롬프트 존재 및 권한 확인
    const existingPrompt = await promptService.getPromptById(promptIdNum);
    
    if (!existingPrompt) {
      return res.fail({
        statusCode: 404,
        error: 'NotFound',
        message: '프롬프트를 찾을 수 없습니다.',
      });
    }

    if (existingPrompt.user_id !== userId) {
      return res.fail({
        statusCode: 403,
        error: 'Forbidden',
        message: '프롬프트를 수정할 권한이 없습니다.',
      });
    }

    const dto: UpdatePromptDto = req.body;
    const result = await promptService.updatePrompt(promptIdNum, dto);
    
    return res.success(result, '프롬프트 수정 성공');
  } catch (error) {
    // 서비스/레포지토리 레이어에서 발생한 특정 에러 처리
    if (error instanceof Error && error.message.includes('모델') && error.message.includes('존재하지 않습니다')) {
      return res.fail({
        statusCode: 404,
        error: 'NotFound',
        message: error.message,
      });
    }

    return res.fail({
      statusCode: 500,
      error: 'InternalServerError',
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    });
  }
};

export const deletePrompt = async (req: Request, res: Response) => {
  try {
    const { promptId } = req.params;
    const promptIdNum = Number(promptId);
    
    if (isNaN(promptIdNum)) {
      return res.fail({
        statusCode: 400,
        error: 'BadRequest',
        message: '유효하지 않은 프롬프트 ID입니다.',
      });
    }

    // 인증 확인
    if (!req.user) {
      return res.fail({
        statusCode: 401,
        error: 'Unauthorized',
        message: '인증이 필요합니다.',
      });
    }
    
    const userId = (req.user as { user_id: number }).user_id;

    // 프롬프트 존재 및 권한 확인
    const existingPrompt = await promptService.getPromptById(promptIdNum);
    
    if (!existingPrompt) {
      return res.fail({
        statusCode: 404,
        error: 'NotFound',
        message: '프롬프트를 찾을 수 없습니다.',
      });
    }

    if (existingPrompt.user_id !== userId) {
      return res.fail({
        statusCode: 403,
        error: 'Forbidden',
        message: '프롬프트를 삭제할 권한이 없습니다.',
      });
    }

    await promptService.deletePrompt(promptIdNum);
    
    return res.success(null, '프롬프트 삭제 성공');
  } catch (error) {
    return res.fail({
      statusCode: 500,
      error: 'InternalServerError',
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    });
  }
};