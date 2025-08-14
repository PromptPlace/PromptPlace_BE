import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { AppError } from "../errors/AppError";

// 업로드된 파일이 저장될 디렉토리
const UPLOADS_DIR = "uploads/";

// 디렉토리가 없으면 생성
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

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
