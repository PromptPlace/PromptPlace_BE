import { Request, Response } from 'express';
import { SearchPromptDto } from './dtos/search-prompt.dto';
import * as promptService from './prompt.service';
import { DEFAULT_PROMPT_SEARCH_SIZE } from '../config/constants';
import { errorHandler } from '../middlewares/errorHandler';

export const searchPrompts = async (req: Request, res: Response) => {
  try {
  const {
    model,
    tag,
    keyword,
    page = '1',
    size = String(DEFAULT_PROMPT_SEARCH_SIZE),
    sort = 'recent',
    is_free = 'false',
  } = req.query;

  // 필수 값(키워드) 유효성 검증
  if (typeof keyword !== 'string' || !keyword.trim()) {
    return res.status(400).json({ message: '검색 결과가 없습니다.' });
  }

  // tag가 문자열인 경우 배열로 변환
  const tagArray = typeof tag === 'string' ? [tag] : (tag as string[]) || [];

  const dto: SearchPromptDto = {
    model: typeof model === 'string' ? model : '',
    tag: tagArray,
    keyword,
    page: Number(page),
    size: Number(size),
    sort: sort as SearchPromptDto['sort'],
    is_free: is_free === 'true',
  };

  const results = await promptService.searchPrompts(dto);

  return res.status(200).json({
    statusCode: 200,
    message: '프롬프트 검색 성공',
    data: results,
  });
} catch (error) {
  return errorHandler(error, req, res, () => {});
}
};
