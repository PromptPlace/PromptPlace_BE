import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHistoryDto {
  @IsString({ message: '이력은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이력은 필수 입력 항목입니다.' })
  history!: string;
} 