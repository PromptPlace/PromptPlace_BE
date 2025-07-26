import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateSnsDto {
  @IsOptional()
  @IsUrl({}, { message: '유효한 URL 형식이 아닙니다.' })
  url?: string;

  @IsOptional()
  @IsString()
  description?: string;
} 