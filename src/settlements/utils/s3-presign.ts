import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppError } from '../../errors/AppError';
import { s3Client } from './s3-client';

const DEFAULT_TTL_SECONDS = 5 * 60;

// 버킷 private 전환 후 관리자 화면 등에서 사업자등록증을 임시 조회할 때 사용.
// DB에 저장된 S3 객체 키를 받아 짧은 TTL의 presigned GET URL 발급.
export const getPresignedDownloadUrl = async (
  objectKey: string,
  expiresInSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<string> => {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    throw new AppError(
      'S3_BUCKET 환경변수가 설정되지 않았습니다.',
      500,
      'ConfigError',
    );
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ResponseCacheControl: 'private, no-store',
  });
  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
};
