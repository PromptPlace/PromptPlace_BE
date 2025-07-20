import MemberRepository from '../repositories/member.repository';

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
}

export default new MemberService(); 