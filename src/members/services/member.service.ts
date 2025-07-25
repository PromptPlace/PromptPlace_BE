import { MemberRepository } from '../repositories/member.repository';
import { CreateSnsDto } from '../dtos/create-sns.dto';
import { AppError } from '../../errors/AppError';

export class MemberService {
  private memberRepository: MemberRepository;

  constructor() {
    this.memberRepository = new MemberRepository();
  }

  async createSns(userId: number, createSnsDto: CreateSnsDto) {
    return this.memberRepository.createSns(userId, createSnsDto);
  }
} 