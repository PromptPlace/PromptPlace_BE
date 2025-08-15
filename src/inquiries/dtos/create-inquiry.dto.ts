import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { InquiryType } from "@prisma/client";

export class CreateInquiryDto {
  @IsNumber(
    { allowNaN: false },
    { message: "받는 사람 ID는 숫자이어야 합니다." }
  )
  @IsNotEmpty({ message: "받는 사람 ID는 필수 입력 항목입니다." })
  receiver_id!: number;

  @IsEnum(InquiryType, { message: "유효하지 않은 문의 유형입니다." })
  @IsNotEmpty({ message: "문의 유형은 필수 입력 항목입니다." })
  type!: InquiryType;

  @IsString({ message: "제목은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "제목은 필수 입력 항목입니다." })
  title!: string;

  @IsString({ message: "내용은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "내용은 필수 입력 항목입니다." })
  content!: string;
}
