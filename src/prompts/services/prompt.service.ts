import { SearchPromptDto } from "../dtos/search-prompt.dto";
import * as promptRepository from "../repositories/prompt.repository";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CreatePromptImageDto } from "../dtos/prompt-image.dto";
import { v4 as uuidv4 } from "uuid";
import { CreatePromptDto } from "../dtos/create-prompt.dto";
import { UpdatePromptDto } from '../dtos/update-prompt.dto';
import eventBus from '../../config/eventBus';
/**
 * 프롬프트 검색 서비스
 */
export const searchPrompts = async (dto: SearchPromptDto) => {
  return await promptRepository.searchPromptRepo(dto);
};

export const getAllPrompts = async () => {
  return await promptRepository.getAllPromptRepo();
}

export const getPromptDetail = async (promptId: number) => {
  return await promptRepository.getPromptDetailRepo(promptId);
}


/**
 * S3 presigned url 발급 (key는 promptimages/uuid_파일명 형식으로 강제)
 * @param key 원본 파일 경로 또는 파일명
 * @param contentType 업로드할 파일의 Content-Type
 * @returns { url, key } presign url과 실제 S3에 저장될 key
 */
export const getPresignedUrl = async (key: string, contentType: string) => {
  // 파일명 추출 및 uuid 추가 → S3에는 promptimages/uuid_파일명 으로 저장
  const lastSlash = key.lastIndexOf("/");
  const filename = lastSlash !== -1 ? key.substring(lastSlash + 1) : key;
  const newKey = `promptimages/${uuidv4()}_${filename}`;

  // S3 클라이언트 생성
  const s3 = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });

  // presign url 발급용 커맨드 생성
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: newKey,
    ContentType: contentType,
  });

  // presign url 발급 (5분 유효)
  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
  return { url, key: newKey };
};

/**
 * PromptImage 매핑 생성 서비스
 * @param prompt_id 프롬프트 ID 
 * @param user_id 사용자 ID
 * @param dto { image_url, order_index }
 */
export const createPromptImage = async (
  prompt_id: number,
  user_id: number,
  dto: CreatePromptImageDto
) => {
  // 2. 실제 존재하는 프롬프트인지 확인
  const prompt = await promptRepository.getPromptByIdRepo(prompt_id);
  
  if (!prompt) {
    throw new Error('프롬프트를 찾을 수 없습니다.');
  }
  
  // 3. user_id 동일한지 확인 (소유자 권한)
  if (prompt.user_id !== user_id) {
    throw new Error('해당 프롬프트에 대한 권한이 없습니다.');
  }
  
  return await promptRepository.createPromptImageRepo(prompt_id, dto);
};

export const createPromptWrite = async (
  user_id: number,
  dto: CreatePromptDto
) => {
  if (dto.categories && dto.categories.length > 5) {
    throw new Error("카테고리는 최대 5개까지 선택할 수 있습니다.");
  }
  const prompt = await promptRepository.createPromptWriteRepo(user_id, dto);
  
  // 새 프롬프트 업로드 알림 이벤트 발생
  eventBus.emit("prompt.created", user_id, prompt?.prompt_id);
  
  return prompt;
};

export const getPromptById = async (promptId: number) => {
  return await promptRepository.getPromptByIdRepo(promptId);
};

export const updatePrompt = async (promptId: number, dto: UpdatePromptDto) => {
  if (dto.categories && dto.categories.length > 5) {
    throw new Error("카테고리는 최대 5개까지 선택할 수 있습니다.");
  }
  return await promptRepository.updatePromptRepo(promptId, dto);
};

export const deletePrompt = async (promptId: number) => {
  return await promptRepository.deletePromptRepo(promptId);
};

export const adminDeletePrompt = async (promptId: number) => {
  return await promptRepository.adminDeletePromptRepo(promptId);
};