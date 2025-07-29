import { IsString, IsEmail, IsOptional, Length } from "class-validator";

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  nickname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
