import { AppError } from '../../errors/AppError';
import { getPresignedDownloadUrl } from './s3-presign';

const BUSINESS_LICENSE_PREFIX = 'business-licenses/';
const ALLOWED_FILE_EXTENSION = /\.(?:jpe?g|png|pdf)$/i;

const validationError = () =>
  new AppError(
    '유효하지 않은 사업자등록증 파일 키입니다.',
    400,
    'ValidationError',
  );

const objectKeyFromLegacyUrl = (value: string): string => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw validationError();
  }

  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION;
  if (!bucket || !region || url.protocol !== 'https:') {
    throw validationError();
  }

  const virtualHostedNames = new Set([
    `${bucket}.s3.${region}.amazonaws.com`,
    `${bucket}.s3.amazonaws.com`,
  ]);

  let pathname = url.pathname.replace(/^\/+/, '');
  if (!virtualHostedNames.has(url.hostname)) {
    const pathStyleNames = new Set([
      `s3.${region}.amazonaws.com`,
      's3.amazonaws.com',
    ]);
    if (!pathStyleNames.has(url.hostname) || !pathname.startsWith(`${bucket}/`)) {
      throw validationError();
    }
    pathname = pathname.slice(bucket.length + 1);
  }

  try {
    return decodeURIComponent(pathname);
  } catch {
    throw validationError();
  }
};

/**
 * 새 요청은 객체 키만 허용하고, 과거에 DB에 저장된 같은 버킷의 직접 URL은
 * 읽기 시 객체 키로 변환한다. 외부 URL을 다시 서명하는 일은 허용하지 않는다.
 */
export const normalizeBusinessLicenseObjectKey = (
  value: string,
  ownerUserId?: number,
): string => {
  if (typeof value !== 'string') throw validationError();

  const trimmed = value.trim();
  const objectKey = /^https?:\/\//i.test(trimmed)
    ? objectKeyFromLegacyUrl(trimmed)
    : trimmed;
  const suffix = objectKey.slice(BUSINESS_LICENSE_PREFIX.length);

  if (
    !objectKey.startsWith(BUSINESS_LICENSE_PREFIX) ||
    objectKey.length > 1024 ||
    !suffix ||
    suffix.includes('\\') ||
    suffix.includes('//') ||
    suffix.split('/').includes('..') ||
    /[\u0000-\u001f\u007f]/.test(suffix) ||
    !ALLOWED_FILE_EXTENSION.test(suffix)
  ) {
    throw validationError();
  }

  if (ownerUserId !== undefined && !suffix.startsWith(`${ownerUserId}/`)) {
    throw validationError();
  }

  return objectKey;
};

export const getBusinessLicenseDownloadUrl = async (
  storedValue: string | null | undefined,
): Promise<string | null> => {
  if (!storedValue) return null;
  const objectKey = normalizeBusinessLicenseObjectKey(storedValue);
  return getPresignedDownloadUrl(objectKey);
};
