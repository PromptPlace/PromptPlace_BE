// 사업자등록증 업로드 magic-byte 검증.
// multer fileFilter는 클라이언트가 위조 가능한 MIME/확장자만 보므로 신뢰 불가.
// 업로드 직전에 실제 파일 시그니처를 한 번 더 확인한다.

interface FileSignature {
  ext: string;
  mime: string;
  bytes: number[];
}

const SIGNATURES: ReadonlyArray<FileSignature> = [
  { ext: '.jpg', mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { ext: '.png', mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { ext: '.pdf', mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] },
];

export interface DetectedFileType {
  ext: string;
  mime: string;
}

export const detectBusinessLicenseFileType = (buffer: Buffer): DetectedFileType | null => {
  if (!buffer || buffer.length < 4) return null;
  for (const sig of SIGNATURES) {
    const match = sig.bytes.every((byte, idx) => buffer[idx] === byte);
    if (match) return { ext: sig.ext, mime: sig.mime };
  }
  return null;
};

// 클라이언트가 제출한 MIME과 실제 시그니처가 일치하는지 추가 검증.
// 확장자만 위장한 파일을 거부.
const ALIAS: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/jpeg': 'image/jpeg',
  'image/png': 'image/png',
  'application/pdf': 'application/pdf',
};

export const isClaimedMimeMatch = (claimedMime: string, detected: DetectedFileType): boolean => {
  const normalized = ALIAS[claimedMime];
  return normalized === detected.mime;
};
