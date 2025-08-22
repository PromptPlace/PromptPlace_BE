import { Service } from "typedi";
import { InquiryRepository } from "../repositories/inquiry.repository";
import { MemberRepository } from "../../members/repositories/member.repository";
import { MessageRepository } from "../../messages/repositories/message.repository";
import { CreateInquiryDto } from "../dtos/create-inquiry.dto";
import { AppError } from "../../errors/AppError";
import eventBus from "../../config/eventBus";
@Service()
export class InquiryService {
  constructor(
    private inquiryRepository: InquiryRepository,
    private memberRepository: MemberRepository,
    private messageRepository: MessageRepository
  ) {}

  async createInquiry(senderId: number, createInquiryDto: CreateInquiryDto) {
    const receiver = await this.memberRepository.findUserById(
      createInquiryDto.receiver_id
    );
    if (!receiver) {
      throw new AppError("해당 수신자를 찾을 수 없습니다.", 404, "NotFound");
    }

    const inquiry = await this.inquiryRepository.createInquiry(
      senderId,
      createInquiryDto
    );

    // 새 문의 알림 이벤트 발생
    eventBus.emit("inquiry.created", receiver.user_id, senderId);

    return inquiry;
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
    const reply = await this.inquiryRepository.createInquiryReply(
      inquiryId,
      userId,
      content
    );

    // 4. 메시지 자동 생성 (inquiry.sender_id -> 문의 보낸 사람)
    try {
      const [sender, receiver] = await Promise.all([
        this.memberRepository.findUserById(userId), // 답변자
        this.memberRepository.findUserById(inquiry.sender_id), // 문의 보낸 사람
      ]);

      if (sender && receiver) {
        const title = `${sender.nickname}님이 ${receiver.nickname}님의 문의에 답변을 남기셨습니다.`;
        const body = content;

        await this.messageRepository.createMessage({
          sender_id: sender.user_id,
          receiver_id: receiver.user_id,
          title,
          body,
        });
      }
    } catch (err) {
      // 메시지 전송 실패는 답변 작성에는 영향 주지 않도록 무시
      console.error("메시지 자동 생성 실패:", err);
    }

    return reply;
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

    return inquiries.map((inquiry) => {
      // sender가 null일 수 있으므로 안전하게 처리
      if (!inquiry.sender) {
        throw new AppError(
          "발신자 정보를 찾을 수 없습니다.",
          500,
          "InternalServerError"
        );
      }

      return {
        inquiry_id: inquiry.inquiry_id,
        sender_id: inquiry.sender_id,
        sender_nickname: inquiry.sender.nickname,
        type: inquiry.type,
        status: inquiry.status,
        title: inquiry.title,
        created_at: inquiry.created_at,
        updated_at: inquiry.updated_at,
      };
    });
  }

  async deleteInquiry(userId: number, inquiryId: number) {
    // 1. 문의 존재 여부 확인
    const inquiry = await this.inquiryRepository.findInquiryById(inquiryId);
    if (!inquiry) {
      throw new AppError("해당 문의를 찾을 수 없습니다.", 404, "NotFound");
    }

    // 2. 삭제 권한 확인 (문의 수신자인지)
    if (inquiry.receiver_id !== userId) {
      throw new AppError("문의를 삭제할 권한이 없습니다.", 403, "Forbidden");
    }

    // 3. 문의 삭제
    await this.inquiryRepository.deleteInquiry(inquiryId);
  }
}
