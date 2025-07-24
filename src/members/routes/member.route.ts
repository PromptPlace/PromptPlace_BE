import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJwt } from '../../config/passport';
import MemberController from '../controllers/member.controller';
import { upload } from '../../middlewares/upload';
import multer from 'multer';

const router = Router();

const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const uploadHandler = upload.single('profile_image');

  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'PayloadTooLarge',
          message: '파일 크기가 너무 큽니다. (최대 5MB)',
          statusCode: 413,
        });
      }
      return res.status(400).json({ 
        error: 'BadRequest',
        message: err.message,
        statusCode: 400
       });
    } else if (err) {
      // fileFilter에서 발생시킨 커스텀 에러
      return res.status(400).json({
        error: 'BadRequest',
        message: err.message,
        statusCode: 400,
      });
    }
    // 성공 시에만 다음 미들웨어(컨트롤러)로 넘어감
    next();
  });
};

// 회원 정보 조회
router.get('/:memberId', authenticateJwt, MemberController.getProfile);

// 프로필 이미지 등록
router.post(
  '/images',
  authenticateJwt,
  uploadMiddleware,
  MemberController.uploadProfileImage
);

// 회원 탈퇴
router.delete('/withdrawal', authenticateJwt, MemberController.withdraw);

// 한줄 소개 작성/수정
router.post('/intros', authenticateJwt, MemberController.upsertIntro);

// 한줄 소개 수정
router.patch('/intros', authenticateJwt, MemberController.updateIntro);

// 이력 작성
router.post('/histories', authenticateJwt, MemberController.createHistory);

// 이력 수정
router.patch('/histories/:historyId', authenticateJwt, MemberController.updateHistory);

// 이력 삭제
router.delete('/histories/:historyId', authenticateJwt, MemberController.deleteHistory);

export default router; 