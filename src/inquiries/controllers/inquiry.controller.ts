import { Request, Response, NextFunction } from 'express';
import { InquiryService } from '../services/inquiry.service';
import { InquiryRepository } from '../repositories/inquiry.repository';
import { MemberRepository } from '../../members/repositories/member.repository';
import { CreateInquiryDto } from '../dtos/create-inquiry.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AppError } from '../../errors/AppError';
import { GetInquiriesDto } from '../dtos/get-inquiries.dto';

export class InquiryController {
  private inquiryService: InquiryService;

  constructor() {
    this.inquiryService = new InquiryService(new InquiryRepository(), new MemberRepository());
  }

  public async createInquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const senderId = (req.user as any).user_id;
      const createInquiryDto = plainToInstance(CreateInquiryDto, req.body);
      const errors = await validate(createInquiryDto);

      if (errors.length > 0) {
        const message = errors.map((error) => Object.values(error.constraints || {})).join(', ');
        throw new AppError('BadRequest', message, 400);
      }

      const inquiry = await this.inquiryService.createInquiry(senderId, createInquiryDto);

      res.status(201).json({
        message: '문의가 등록되었습니다.',
        data: inquiry,
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getReceivedInquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const receiverId = (req.user as any).user_id;
      const getInquiriesDto = plainToInstance(GetInquiriesDto, req.query);
      const errors = await validate(getInquiriesDto);

      if (errors.length > 0) {
        const message = errors.map((error) => Object.values(error.constraints || {})).join(', ');
        throw new AppError('BadRequest', message, 400);
      }

      const inquiries = await this.inquiryService.getReceivedInquiries(receiverId, getInquiriesDto.type);

      res.status(200).json({
        message: '받은 문의 목록 조회 완료',
        data: inquiries,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }
} 