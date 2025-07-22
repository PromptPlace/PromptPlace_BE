import { Request, Response } from "express";
import { SearchPromptDto } from "../dtos/search-prompt.dto";
import * as promptService from "../prompt.service";
import { DEFAULT_PROMPT_SEARCH_SIZE } from "../../config/constants";
import { errorHandler } from "../../middlewares/errorHandler";
import { CreatePromptImageDto } from "../dtos/prompt-image.dto";

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
    } = req.query;

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
