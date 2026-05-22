import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './s3-client';

const DEFAULT_TTL_SECONDS = 5 * 60;

// 버킷 private 전환 후 관리자 화면 등에서 사업자등록증을 임시 조회할 때 사용.
// DB에 저장된 S3 객체 키를 받아 짧은 TTL의 presigned GET URL 발급.
export const getPresignedDownloadUrl = async (
  objectKey: string,
  expiresInSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: objectKey,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
};
