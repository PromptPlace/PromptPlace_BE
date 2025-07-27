import { Service } from 'typedi';
import { InquiryRepository } from '../repositories/inquiry.repository';
import { MemberRepository } from '../../members/repositories/member.repository';
import { CreateInquiryDto } from '../dtos/create-inquiry.dto';
import { AppError } from '../../errors/AppError';

@Service()
export class InquiryService {
  constructor(
    private inquiryRepository: InquiryRepository,
    private memberRepository: MemberRepository,
  ) {}

  async createInquiry(senderId: number, createInquiryDto: CreateInquiryDto) {
    const receiver = await this.memberRepository.findUserById(createInquiryDto.receiver_id);
    if (!receiver) {
      throw new AppError('NotFound', '해당 수신자를 찾을 수 없습니다.', 404);
    }

    return this.inquiryRepository.createInquiry(senderId, createInquiryDto);
  }

  async getReceivedInquiries(receiverId: number, type?: 'buyer' | 'non_buyer') {
    const inquiries = await this.inquiryRepository.findReceivedInquiries(receiverId, type);

    return inquiries.map((inquiry) => ({
      inquiry_id: inquiry.inquiry_id,
      sender_id: inquiry.sender_id,
      sender_nickname: inquiry.sender.nickname,
      type: inquiry.type,
      status: inquiry.status,
      title: inquiry.title,
      created_at: inquiry.created_at,
      updated_at: inquiry.updated_at,
    }));
  }
} 