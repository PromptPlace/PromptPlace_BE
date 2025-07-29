import { IsString, Length } from "class-validator";

export class CreateIntroDto {
  @IsString({ message: "한줄 소개는 문자열이어야 합니다." })
  @Length(1, 100, {
    message: "한줄 소개는 1자 이상 100자 이하로 입력해주세요.",
  })
  intro!: string;
}
