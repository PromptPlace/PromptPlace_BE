import { IsNotEmpty, IsString } from "class-validator";

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty({ message: "답변 내용은 필수 입력 항목입니다." })
  content!: string;
}
