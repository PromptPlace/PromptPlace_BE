import { SearchPromptDto } from "./dtos/search-prompt.dto";
import * as promptRepository from "./prompt.repository";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CreatePromptImageDto } from "./dtos/prompt-image.dto";

export const searchPrompts = async (dto: SearchPromptDto) => {
  return await promptRepository.searchPromptRepo(dto);
};

export const getPresignedUrl = async (key: string, contentType: string) => {
  const s3 = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5분
  return url;
};

export const createPromptImage = async (
  prompt_id: number,
  dto: CreatePromptImageDto
) => {
  return await promptRepository.createPromptImageRepo(prompt_id, dto);
};
