import { IsEnum, IsOptional } from 'class-validator';
import { InquiryType } from '@prisma/client';

export class GetInquiriesDto {
  @IsOptional()
  @IsEnum(InquiryType, { message: 'type은 buyer 또는 non_buyer만 가능합니다.' })
  type?: InquiryType;
} 