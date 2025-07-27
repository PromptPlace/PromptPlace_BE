import { Service } from 'typedi';
import prisma from '../../config/prisma';
import { CreateInquiryDto } from '../dtos/create-inquiry.dto';

@Service()
export class InquiryRepository {
  async createInquiry(senderId: number, createInquiryDto: CreateInquiryDto) {
    return prisma.inquiry.create({
      data: {
        sender_id: senderId,
        receiver_id: createInquiryDto.receiver_id,
        type: createInquiryDto.type,
        status: 'waiting',
        title: createInquiryDto.title,
        content: createInquiryDto.content,
      },
    });
  }
} 