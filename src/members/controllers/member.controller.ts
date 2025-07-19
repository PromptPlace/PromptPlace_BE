import { Request, Response } from 'express';
import MemberService from '../services/member.service';

class MemberController {
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
}

export default new MemberController(); 