import MemberRepository from '../repositories/member.repository';
import { AppError } from '../../errors/AppError';
import { Prisma } from '@prisma/client';

class MemberService {
  async updateUserIntro(userId: number, intro: string) {
    if (!intro || intro.length > 100) {
      throw new AppError('한줄 소개는 1자 이상 100자 이하로 입력해주세요.', 400, 'BadRequest');
    }

    try {
      return await MemberRepository.updateUserIntro(userId, intro);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('수정할 한줄 소개를 찾을 수 없습니다.', 404, 'NotFound');
      }
      throw error;
    }
  }

  async upsertUserIntro(userId: number, intro: string) {
    if (!intro || intro.length > 100) {
      throw new AppError('한줄 소개는 1자 이상 100자 이하로 입력해주세요.', 400, 'BadRequest');
    }
    return await MemberRepository.upsertUserIntro(userId, intro);
  }

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
      intros: member.intro?.description || null, // member.profile.description 대신 member.intro.description 사용
      created_at: member.created_at,
      updated_at: member.updated_at,
      status: member.status,
    };
  }
}

export default new MemberService(); 