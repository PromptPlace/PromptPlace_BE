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

export class GetAccountResponseDto {
  account_id!: number;
  bank_code!: string;
  bank_name!: string;
  account_number!: string;
  account_holder!: string;
}

export class UpdateAccountDto {
  @IsString()
  @Length(3, 3)
  bank_code!: string;

  @IsString()
  bank_name!: string;

  @IsString()
  account_number!: string;

  @IsString()
  account_holder!: string;
}