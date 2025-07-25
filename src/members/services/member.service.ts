import { MemberRepository } from '../repositories/member.repository';
import { CreateSnsDto } from '../dtos/create-sns.dto';
import { AppError } from '../../errors/AppError';
import { UpdateSnsDto } from '../dtos/update-sns.dto';

export class MemberService {
  private memberRepository: MemberRepository;

  constructor() {
    this.memberRepository = new MemberRepository();
  }

  async createSns(userId: number, createSnsDto: CreateSnsDto) {
    return this.memberRepository.createSns(userId, createSnsDto);
  }

  async updateSns(userId: number, snsId: number, updateSnsDto: UpdateSnsDto) {
    const sns = await this.memberRepository.findSnsById(snsId);

    if (!sns) {
      throw new AppError('NotFound', '해당 SNS를 찾을 수 없습니다.', 404);
    }

    if (sns.user_id !== userId) {
      throw new AppError('Forbidden', '자신의 SNS만 수정할 수 있습니다.', 403);
    }

    return this.memberRepository.updateSns(snsId, updateSnsDto);
  }

  async deleteSns(userId: number, snsId: number) {
    const sns = await this.memberRepository.findSnsById(snsId);

    if (!sns) {
      throw new AppError('NotFound', '해당 SNS 정보를 찾을 수 없습니다.', 404);
    }

    if (sns.user_id !== userId) {
      throw new AppError('Forbidden', '해당 SNS 정보를 삭제할 권한이 없습니다.', 403);
    }

    return this.memberRepository.deleteSns(snsId);
  }
} 