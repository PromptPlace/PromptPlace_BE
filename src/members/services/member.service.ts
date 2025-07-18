import MemberRepository from '../repositories/member.repository';

class MemberService {
  async withdrawUser(userId: number): Promise<void> {
    await MemberRepository.softDeleteUser(userId);
  }
}

export default new MemberService(); 