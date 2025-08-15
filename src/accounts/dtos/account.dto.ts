import { IsString, Length } from "class-validator";

export class RegisterAccountDto {
  @IsString()
  @Length(3, 3)
  bank_code!: string;

  @IsString()
  account_number!: string;

  @IsString()
  account_holder!: string;
}