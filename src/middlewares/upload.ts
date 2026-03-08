import multer from "multer";
import path from "path";
import { Request } from "express";
import { AppError } from "../errors/AppError";

// Multer 저장소 설정
const storage = multer.memoryStorage(); // S3 업로드용으로 메모리 스토리지 사용

// 파일 필터 함수 (이미지 파일만 허용)
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    return cb(null, true);
  }
  // 명세서에 맞는 에러 메시지로 AppError를 생성하여 전달
  cb(
    new AppError(
      "지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif만 업로드 가능)",
      400,
      "BadRequest"
    )
  );
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
});

const businessLicenseFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|pdf/; 
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    return cb(null, true);
  }
  
  cb(
    new AppError(
      "지원하지 않는 파일 형식입니다. (jpg, jpeg, png, pdf만 가능)",
      415,
      "InvalidFileType"
    )
  );
};

// 사업자등록증 전용 업로드 미들웨어 (20MB 제한)
export const uploadBusinessLicense = multer({
  storage: storage, // 기존 메모리 스토리지 재활용
  fileFilter: businessLicenseFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});
