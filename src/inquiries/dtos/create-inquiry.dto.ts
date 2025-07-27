import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { InquiryType } from '@prisma/client';

export class CreateInquiryDto {
  @IsNumber()
  @IsNotEmpty()
  receiver_id: number;

  @IsEnum(InquiryType)
  @IsNotEmpty()
  type: InquiryType;

  @IsString()
  @IsNotEmpty({ message: '제목은 필수 입력 항목입니다.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '내용은 필수 입력 항목입니다.' })
  content: string;
} 