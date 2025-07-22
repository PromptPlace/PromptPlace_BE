import MemberRepository from '../repositories/member.repository';
import { AppError } from '../../errors/AppError';

class MemberService {
  async uploadProfileImage(userId: number, file: Express.Multer.File): Promise<string> {
    // 실제 서버에서는 파일 접근을 위한 전체 URL을 생성해야 함
    // 예: const imageUrl = `https://your-domain.com/${file.path}`;
    const imageUrl = file.path; 

    await MemberRepository.upsertProfileImage(userId, imageUrl);
    return imageUrl;
  }

  async withdrawUser(userId: number): Promise<void> {
    await MemberRepository.softDeleteUser(userId);
  }

  async getMemberProfile(memberId: number) {
    const member = await MemberRepository.findMemberById(memberId);

    if (!member) {
      throw new AppError('해당 회원을 찾을 수 없습니다.', 404, 'NotFound');
    }

    // 명세서에 맞는 응답 형태로 데이터 가공
    return {
      member_id: member.user_id,
      email: member.email,
      name: member.name,
      nickname: member.nickname,
      intros: member.profile?.description || null,
      created_at: member.created_at,
      updated_at: member.updated_at,
      status: member.status,
    };
  }
}

export default new MemberService(); 