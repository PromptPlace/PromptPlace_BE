import test from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from '../src/errors/AppError';
import { normalizeBusinessLicenseObjectKey } from '../src/settlements/utils/business-license-storage';

const withS3Config = (run: () => void) => {
  const originalBucket = process.env.S3_BUCKET;
  const originalRegion = process.env.S3_REGION;
  process.env.S3_BUCKET = 'private-documents';
  process.env.S3_REGION = 'ap-northeast-2';
  try {
    run();
  } finally {
    if (originalBucket === undefined) delete process.env.S3_BUCKET;
    else process.env.S3_BUCKET = originalBucket;
    if (originalRegion === undefined) delete process.env.S3_REGION;
    else process.env.S3_REGION = originalRegion;
  }
};

test('사업자등록증은 요청 사용자 prefix의 객체 키만 등록할 수 있다', () => {
  assert.equal(
    normalizeBusinessLicenseObjectKey('business-licenses/12/license.pdf', 12),
    'business-licenses/12/license.pdf',
  );
  assert.throws(
    () => normalizeBusinessLicenseObjectKey('business-licenses/13/license.pdf', 12),
    (error: unknown) =>
      error instanceof AppError &&
      error.statusCode === 400 &&
      error.error === 'ValidationError',
  );
});

test('과거 같은 버킷 직접 URL은 객체 키로 변환한다', () => {
  withS3Config(() => {
    assert.equal(
      normalizeBusinessLicenseObjectKey(
        'https://private-documents.s3.ap-northeast-2.amazonaws.com/business-licenses/12/license.pdf',
      ),
      'business-licenses/12/license.pdf',
    );
  });
});

test('외부 URL과 경로 이탈 객체 키는 거절한다', () => {
  withS3Config(() => {
    assert.throws(() =>
      normalizeBusinessLicenseObjectKey(
        'https://attacker.example/business-licenses/12/license.pdf',
      ),
    );
    assert.throws(() =>
      normalizeBusinessLicenseObjectKey('business-licenses/12/../13/license.pdf'),
    );
    assert.throws(() =>
      normalizeBusinessLicenseObjectKey('public/license.pdf'),
    );
  });
});
