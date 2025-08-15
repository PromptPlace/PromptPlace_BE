import { IsString, IsUrl } from "class-validator";

export class CreateSnsDto {
  @IsUrl({}, { message: "유효한 URL 형식이 아닙니다." })
  url!: string;

  @IsString({ message: "설명은 문자열이어야 합니다." })
  description!: string;
}
