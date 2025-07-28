import { Service } from "typedi";
import prisma from "../../config/prisma";
import { CreateInquiryDto } from "../dtos/create-inquiry.dto";

@Service()
export class InquiryRepository {
  async findInquiryById(inquiryId: number) {
    return prisma.inquiry.findUnique({
      where: {
        inquiry_id: inquiryId,
      },
      include: {
        sender: {
          select: {
            nickname: true,
          },
        },
        receiver: {
          select: {
            nickname: true,
          },
        },
      },
    });
  }

  async createInquiry(senderId: number, createInquiryDto: CreateInquiryDto) {
    return prisma.inquiry.create({
      data: {
        sender_id: senderId,
        receiver_id: createInquiryDto.receiver_id,
        type: createInquiryDto.type,
        status: "waiting",
        title: createInquiryDto.title,
        content: createInquiryDto.content,
      },
    });
  }

  async findReceivedInquiries(
    receiverId: number,
    type?: "buyer" | "non_buyer"
  ) {
    return prisma.inquiry.findMany({
      where: {
        receiver_id: receiverId,
        ...(type && { type }),
      },
      select: {
        inquiry_id: true,
        sender_id: true,
        sender: {
          select: {
            nickname: true,
          },
        },
        type: true,
        status: true,
        title: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }
}
