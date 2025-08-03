import { Service } from "typedi";
import { InquiryRepository } from "../repositories/inquiry.repository";
import { MemberRepository } from "../../members/repositories/member.repository";
import { CreateInquiryDto } from "../dtos/create-inquiry.dto";
import { AppError } from "../../errors/AppError";

@Service()
export class InquiryService {
  constructor(
    private inquiryRepository: InquiryRepository,
    private memberRepository: MemberRepository
  ) {}

  async createInquiry(senderId: number, createInquiryDto: CreateInquiryDto) {
    const receiver = await this.memberRepository.findUserById(
      createInquiryDto.receiver_id
    );
    if (!receiver) {
      throw new AppError("해당 수신자를 찾을 수 없습니다.", 404, "NotFound");
    }

    return this.inquiryRepository.createInquiry(senderId, createInquiryDto);
  }

  async getInquiryById(userId: number, inquiryId: number) {
    const inquiry = await this.inquiryRepository.findInquiryById(inquiryId);

    if (!inquiry) {
      throw new AppError("해당 문의를 찾을 수 없습니다.", 404, "NotFound");
    }

    if (inquiry.sender_id !== userId && inquiry.receiver_id !== userId) {
      throw new AppError(
        "해당 문의를 조회할 권한이 없습니다.",
        403,
        "Forbidden"
      );
    }

    return {
      inquiry_id: inquiry.inquiry_id,
      sender_id: inquiry.sender_id,
      sender_nickname: inquiry.sender.nickname,
      receiver_id: inquiry.receiver_id,
      receiver_nickname: inquiry.receiver.nickname,
      type: inquiry.type,
      status: inquiry.status,
      title: inquiry.title,
      content: inquiry.content,
      created_at: inquiry.created_at,
      updated_at: inquiry.updated_at,
    };
  }

  async createInquiryReply(userId: number, inquiryId: number, content: string) {
    // 1. 문의 존재 여부 확인
    const inquiry = await this.inquiryRepository.findInquiryById(inquiryId);
    if (!inquiry) {
      throw new AppError("해당 문의를 찾을 수 없습니다.", 404, "NotFound");
    }

    // 2. 답변 권한 확인 (문의의 수신자인지)
    if (inquiry.receiver_id !== userId) {
      throw new AppError(
        "해당 문의에 답변할 권한이 없습니다.",
        403,
        "Forbidden"
      );
    }

    // 3. 답변 생성
    return this.inquiryRepository.createInquiryReply(
      inquiryId,
      userId,
      content
    );
  }

  async markInquiryAsRead(userId: number, inquiryId: number) {
    // 1. 문의 존재 여부 확인
    const inquiry = await this.inquiryRepository.findInquiryById(inquiryId);
    if (!inquiry) {
      throw new AppError("해당 문의를 찾을 수 없습니다.", 404, "NotFound");
    }

    // 2. 읽음 처리 권한 확인 (문의의 수신자인지)
    if (inquiry.receiver_id !== userId) {
      throw new AppError(
        "해당 문의를 읽음 처리할 권한이 없습니다.",
        403,
        "Forbidden"
      );
    }

    // 3. 문의 상태 변경
    return this.inquiryRepository.updateInquiryStatus(inquiryId, "read");
  }

  async getReceivedInquiries(receiverId: number, type?: "buyer" | "non_buyer") {
    const inquiries = await this.inquiryRepository.findReceivedInquiries(
      receiverId,
      type
    );

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
