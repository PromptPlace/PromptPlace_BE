import { Request, Response, NextFunction } from 'express';
import MemberService from '../services/member.service';
import { AppError } from '../../errors/AppError';
import multer from 'multer';

class MemberController {
  async uploadProfileImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          error: 'BadRequest',
          message: '파일이 업로드되지 않았습니다.',
          statusCode: 400,
        });
        return;
      }

      const user = req.user as any;
      await MemberService.uploadProfileImage(user.user_id, req.file);

      res.status(200).json({
        message: '프로필 이미지 등록 완료',
        statusCode: 200,
      });

    } catch (error) {
      console.error(error); // 서버 로그는 남겨두는 것이 좋습니다.
      res.status(500).json({
        error: 'InternalServerError',
        message: '알 수 없는 오류가 발생했습니다.',
        statusCode: 500,
      });
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const memberId = parseInt(req.params.memberId, 10);
      const authenticatedUser = req.user as any;

      // 로그인한 사용자가 자신의 정보에만 접근하는지 확인
      if (authenticatedUser.user_id !== memberId) {
        throw new AppError('해당 회원 정보에 접근할 권한이 없습니다.', 403, 'Forbidden');
      }

      const memberProfile = await MemberService.getMemberProfile(memberId);
      
      res.success(memberProfile, '회원 정보 조회 완료');

    } catch (error) {
      next(error); // 모든 에러를 errorHandler로 전달
    }
  }

  async withdraw(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      await MemberService.withdrawUser(user.user_id);
      res.status(200).json({ message: '회원 탈퇴가 성공적으로 처리되었습니다.' });
    } catch (error) {
      console.error('Withdrawal error:', error);
      res.status(500).json({ message: '회원 탈퇴 처리 중 오류가 발생했습니다.' });
    }
  }

  async upsertIntro(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as any;
      const { intro } = req.body;

      const updatedIntro = await MemberService.upsertUserIntro(user.user_id, intro);

      res.status(200).json({
        message: '한줄 소개가 성공적으로 작성되었습니다.',
        intro: updatedIntro.description,
        updated_at: updatedIntro.updated_at,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateIntro(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as any;
      const { intro } = req.body;

      const updatedIntro = await MemberService.updateUserIntro(user.user_id, intro);

      res.status(200).json({
        message: '한줄 소개가 성공적으로 수정되었습니다.',
        intro: updatedIntro.description,
        updated_at: updatedIntro.updated_at,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MemberController(); 