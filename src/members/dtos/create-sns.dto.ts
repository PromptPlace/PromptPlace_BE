import { IsString, IsUrl } from 'class-validator';

export class CreateSnsDto {
  @IsUrl({}, { message: '유효한 URL 형식이 아닙니다.' })
  url!: string;

  @IsString()
  description!: string;
} 