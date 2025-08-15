import { IsOptional, IsString, Length } from "class-validator";

export class UpdateIntroDto {
  @IsString({ message: "한줄 소개는 문자열이어야 합니다." })
  @IsOptional()
  @Length(0, 100, {
    message: "한줄 소개는 100자 이하로 입력해주세요.",
  })
  intro!: string;
}
