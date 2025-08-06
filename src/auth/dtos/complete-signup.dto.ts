import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
} from "class-validator";

export class CompleteSignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nickname: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sns_url?: string;
}
